'use client';

import { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LogMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TerminalLogProps {
  logs: LogMessage[];
  onClear?: () => void;
  maxLines?: number;
  className?: string;
}

const LOG_COLORS: Record<string, string> = {
  SYSTEM: 'text-green-500',
  MISSION: 'text-yellow-400',
  COLLAB: 'text-red-400',
  COMPLETE: 'text-cyan-400',
  AGENT: 'text-white',
};

export function TerminalLog({
  logs,
  onClear,
  maxLines = 50,
  className,
}: TerminalLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (date: Date): string => {
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `[${minutes}:${seconds}]`;
  };

  const formatLogLine = (log: LogMessage): string => {
    const timestamp = formatTimestamp(log.timestamp);
    let prefix = '';

    switch (log.type) {
      case 'SYSTEM':
        prefix = '> SYSTEM';
        break;
      case 'MISSION':
        prefix = '> [MISSION]';
        break;
      case 'COLLAB':
        prefix = '> [COLLAB]';
        break;
      case 'COMPLETE':
        prefix = '> [COMPLETE]';
        break;
      case 'AGENT':
        prefix = '>';
        break;
      default:
        prefix = '>';
    }

    return `${prefix} ${log.content} ${timestamp}`;
  };

  const getLogColor = (logType: string): string => {
    return LOG_COLORS[logType] || LOG_COLORS.AGENT;
  };

  const displayedLogs = logs.slice(-maxLines);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">TERMINAL LOG</CardTitle>
        {onClear && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="h-8 text-xs"
          >
            CLEAR
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="h-64 overflow-y-auto rounded-md bg-black p-4 font-mono text-sm"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#4a4a6e #0a0a0f',
          }}
        >
          {displayedLogs.length === 0 ? (
            <p className="text-green-500 opacity-50">
              &gt; Waiting for logs...
            </p>
          ) : (
            <div className="space-y-1">
              {displayedLogs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    'whitespace-pre-wrap break-words transition-opacity',
                    'animate-in slide-in-from-left-2 duration-300',
                    getLogColor(log.type)
                  )}
                >
                  {formatLogLine(log)}
                </div>
              ))}
            </div>
          )}

          {displayedLogs.length > 0 && (
            <div className="mt-2 text-green-500 opacity-50">
              ▼ {displayedLogs.length} / {maxLines} lines
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
