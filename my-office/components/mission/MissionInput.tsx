'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MissionInputProps {
  onExecute?: (mission: string) => void;
  isExecuting?: boolean;
  className?: string;
}

type MissionStatus = 'idle' | 'executing' | 'completed';

export function MissionInput({
  onExecute,
  isExecuting = false,
  className,
}: MissionInputProps) {
  const [mission, setMission] = useState('');
  const [status, setStatus] = useState<MissionStatus>('idle');

  const maxLength = 100;
  const remainingChars = maxLength - mission.length;

  const handleExecute = () => {
    if (!mission.trim() || isExecuting) return;

    setStatus('executing');
    onExecute?.(mission);

    // Simulate completion after 2 seconds
    setTimeout(() => {
      setStatus('completed');
      setTimeout(() => {
        setStatus('idle');
        setMission('');
      }, 1500);
    }, 2000);
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

          {/* Input Field */}
          <div className="relative">
            <Input
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
        </div>
      </CardContent>
    </Card>
  );
}
