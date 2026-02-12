'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentPixelArt } from './AgentPixelArt';
import { AGENT_COLORS, AGENT_ROLES } from '@/lib/types/agent';
import type { Agent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  IDLE: 'bg-gray-500',
  MOVING: 'bg-cyan-500',
  WORKING: 'bg-orange-500',
  COMMUNICATING: 'bg-red-500',
  RESTING: 'bg-green-500',
};

const ZONE_LABELS: Record<string, string> = {
  work: 'WORK ZONE',
  meeting: 'MEETING ROOM',
  lounge: 'LOUNGE',
};

export function AgentCard({ agent, className }: AgentCardProps) {
  const agentColor = AGENT_COLORS[agent.id];
  const agentRole = AGENT_ROLES[agent.id];
  const statusColor = STATUS_COLORS[agent.status] || 'bg-gray-500';

  return (
    <Card
      className={cn('w-full max-w-xs', className)}
      style={{ borderColor: agentColor }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Pixel Art */}
          <AgentPixelArt agentId={agent.id} status={agent.status} scale={3} />

          {/* Agent Name */}
          <div className="text-center">
            <h3
              className="text-xl font-bold uppercase"
              style={{ color: agentColor }}
            >
              {agent.name}
            </h3>
            <p className="text-sm text-muted-foreground">{agentRole}</p>
          </div>

          {/* Status */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                STATUS
              </span>
              <Badge className={cn(statusColor, 'text-white')}>
                {agent.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                LOCATION
              </span>
              <Badge variant="outline">{ZONE_LABELS[agent.zone]}</Badge>
            </div>

            {agent.stressLevel !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  STRESS
                </span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-24 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{ width: `${agent.stressLevel}%` }}
                    />
                  </div>
                  <span className="text-xs">{agent.stressLevel}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
