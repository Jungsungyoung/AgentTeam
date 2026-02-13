'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useClaudeTeam } from '@/lib/hooks/useClaudeTeam';
import type { ExecutionMode } from '@/lib/types/sse';

interface MissionInputProps {
  onExecute?: (mission: string) => void;
  isExecuting?: boolean;
  className?: string;
}

type MissionStatus = 'idle' | 'executing' | 'completed';

// Mode descriptions for tooltips
const MODE_INFO = {
  simulation: {
    title: 'Simulation Mode',
    description: 'No API calls, instant responses with pre-defined agent behaviors',
    apiRequired: false,
    icon: '🎮',
    color: 'blue',
  },
  hybrid: {
    title: 'Hybrid Mode',
    description: 'Cached responses for similar missions + API calls for new ones',
    apiRequired: true,
    icon: '⚡',
    color: 'orange',
  },
  real: {
    title: 'Real AI Mode',
    description: 'Always use Claude API for fresh, real-time agent collaboration',
    apiRequired: true,
    icon: '🤖',
    color: 'green',
  },
} as const;

export function MissionInput({
  onExecute,
  isExecuting = false,
  className,
}: MissionInputProps) {
  const [mission, setMission] = useState('');
  const [status, setStatus] = useState<MissionStatus>('idle');
  const [mode, setMode] = useState<ExecutionMode>('simulation');
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  // Hook for Claude Team integration
  const { executeMission, isProcessing, error, cacheStatus, disconnect } = useClaudeTeam();

  const maxLength = 100;
  const remainingChars = maxLength - mission.length;

  const handleExecute = async () => {
    if (!mission.trim() || isExecuting || isProcessing) return;

    setStatus('executing');
    setEstimatedCost(null);

    // Estimate cost based on token count (rough estimate)
    const estimatedTokens = Math.ceil(mission.length / 4);
    if (mode !== 'simulation') {
      setEstimatedCost(estimatedTokens * 0.000015); // $15 per 1M tokens (approximate)
    }

    // Call original onExecute callback if provided
    onExecute?.(mission);

    try {
      // Execute mission with selected mode
      await executeMission(mission, mode);

      setStatus('completed');
      setTimeout(() => {
        setStatus('idle');
        setMission('');
        setEstimatedCost(null);
      }, 1500);
    } catch (err) {
      console.error('Mission execution failed:', err);
      setStatus('idle');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const getButtonConfig = () => {
    switch (status) {
      case 'executing':
        return {
          text: '⏳ PROCESSING...',
          className: 'bg-gradient-to-r from-orange-500 to-orange-600',
          disabled: true,
        };
      case 'completed':
        return {
          text: '✓ COMPLETED',
          className: 'bg-gradient-to-r from-green-500 to-green-600',
          disabled: true,
        };
      default:
        return {
          text: '▶ EXECUTE',
          className: 'bg-gradient-to-r from-red-500 to-red-600',
          disabled: !mission.trim() || isExecuting,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">MISSION INPUT</h3>
              <span className="text-sm text-muted-foreground">
                {remainingChars}/{maxLength}
              </span>
            </div>

            {/* Execution Mode Selector with Tooltips */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  EXECUTION MODE
                </label>
                {MODE_INFO[mode].apiRequired && (
                  <Badge variant="outline" className="text-xs">
                    API Key Required
                  </Badge>
                )}
              </div>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md cursor-pointer border-2 transition-all',
                        mode === 'simulation'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 font-semibold'
                          : 'border-gray-300 hover:border-gray-400',
                        status !== 'idle' && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value="simulation"
                        checked={mode === 'simulation'}
                        onChange={(e) => setMode(e.target.value as ExecutionMode)}
                        disabled={status !== 'idle'}
                        className="sr-only"
                      />
                      <span className="text-sm">
                        {MODE_INFO.simulation.icon} Simulation
                      </span>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-semibold">{MODE_INFO.simulation.title}</p>
                      <p className="text-sm text-muted-foreground">{MODE_INFO.simulation.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <label
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md cursor-pointer border-2 transition-all',
                        mode === 'hybrid'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600 font-semibold'
                          : 'border-gray-300 hover:border-gray-400',
                        status !== 'idle' && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value="hybrid"
                        checked={mode === 'hybrid'}
                        onChange={(e) => setMode(e.target.value as ExecutionMode)}
                        disabled={status !== 'idle'}
                        className="sr-only"
                      />
                      <span className="text-sm">
                        {MODE_INFO.hybrid.icon} Hybrid
                      </span>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-semibold">{MODE_INFO.hybrid.title}</p>
                      <p className="text-sm text-muted-foreground">{MODE_INFO.hybrid.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <label
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md cursor-pointer border-2 transition-all',
                        mode === 'real'
                          ? 'border-green-500 bg-green-500/10 text-green-600 font-semibold'
                          : 'border-gray-300 hover:border-gray-400',
                        status !== 'idle' && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value="real"
                        checked={mode === 'real'}
                        onChange={(e) => setMode(e.target.value as ExecutionMode)}
                        disabled={status !== 'idle'}
                        className="sr-only"
                      />
                      <span className="text-sm">
                        {MODE_INFO.real.icon} Real AI
                      </span>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-semibold">{MODE_INFO.real.title}</p>
                      <p className="text-sm text-muted-foreground">{MODE_INFO.real.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

          {/* Input Field */}
          <div className="relative">
            <Input
              data-testid="mission-input"
              value={mission}
              onChange={(e) => setMission(e.target.value.slice(0, maxLength))}
              onKeyDown={handleKeyDown}
              placeholder="💬 Enter your mission here..."
              disabled={status !== 'idle'}
              className="h-20 resize-none text-base"
              maxLength={maxLength}
            />
          </div>

          {/* Execute Button */}
          <div className="flex justify-center">
            <Button
              data-testid="execute-mission-button"
              onClick={handleExecute}
              disabled={buttonConfig.disabled}
              className={cn(
                'w-48 h-12 text-base font-bold transition-all',
                buttonConfig.className,
                'hover:brightness-110'
              )}
            >
              {buttonConfig.text}
            </Button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-center text-muted-foreground">
            Press Enter to execute or click the button above
          </p>

          {/* Cache Status Indicator */}
            {mode === 'hybrid' && isProcessing && (
              <div className="flex items-center justify-between p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-600 font-medium">
                    Checking cache...
                  </span>
                </div>
              </div>
            )}

            {cacheStatus && (
              <div
                className={cn(
                  'flex items-center justify-between p-3 rounded-md border',
                  cacheStatus === 'hit'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-yellow-500/10 border-yellow-500/20'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {cacheStatus === 'hit' ? '✓ Cache Hit' : '⚠ Cache Miss'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cacheStatus === 'hit'
                      ? 'Using cached response (no API cost)'
                      : 'Executing new mission (API call)'}
                  </span>
                </div>
                {estimatedCost !== null && cacheStatus === 'miss' && (
                  <Badge variant="outline" className="text-xs">
                    Est. ${estimatedCost.toFixed(4)}
                  </Badge>
                )}
              </div>
            )}

            {/* Error Display with Enhanced Messages */}
            {error && (
              <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 text-lg">❌</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-600 font-medium">{error}</p>

                    {/* API Key Missing Error */}
                    {error.includes('API') && error.includes('key') && (
                      <div className="mt-2 p-3 bg-white/50 rounded border border-red-200">
                        <p className="text-xs font-semibold mb-1">Setup Guide:</p>
                        <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                          <li>Create a <code className="px-1 py-0.5 bg-gray-200 rounded">.env.local</code> file in my-office/</li>
                          <li>Add: <code className="px-1 py-0.5 bg-gray-200 rounded">ANTHROPIC_API_KEY=your_key_here</code></li>
                          <li>Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">console.anthropic.com</a></li>
                          <li>Restart the dev server</li>
                        </ol>
                      </div>
                    )}

                    {/* Rate Limit Error */}
                    {error.toLowerCase().includes('rate limit') && (
                      <div className="mt-2 p-3 bg-white/50 rounded border border-red-200">
                        <p className="text-xs font-semibold mb-1">Rate Limit Exceeded</p>
                        <p className="text-xs text-muted-foreground">
                          Please wait a moment before retrying. Consider using Hybrid mode to reduce API calls.
                        </p>
                      </div>
                    )}

                    {/* Network Error */}
                    {error.toLowerCase().includes('network') || error.toLowerCase().includes('connection') && (
                      <div className="mt-2 p-3 bg-white/50 rounded border border-red-200">
                        <p className="text-xs font-semibold mb-1">Connection Issue</p>
                        <p className="text-xs text-muted-foreground">
                          Check your internet connection and try again.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleExecute}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={!mission.trim()}
                  >
                    🔄 Retry
                  </Button>
                  <Button
                    onClick={() => {
                      disconnect();
                      setStatus('idle');
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                  >
                    ✕ Dismiss
                  </Button>
                  {MODE_INFO[mode].apiRequired && (
                    <Button
                      onClick={() => setMode('simulation')}
                      size="sm"
                      variant="secondary"
                      className="text-xs"
                    >
                      Switch to Simulation
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Connection Status with Progress */}
            {isProcessing && !error && (
              <div className="flex items-center justify-between p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 font-medium">
                    🟢 Connected to Claude Team
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {mode === 'simulation' ? 'Simulating...' : mode === 'hybrid' ? 'Hybrid Mode Active' : 'Real AI Processing...'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
