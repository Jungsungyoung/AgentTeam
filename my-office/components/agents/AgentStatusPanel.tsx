'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AgentCard } from './AgentCard';
import type { Agent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AgentStatusPanelProps {
  agents: Agent[];
  className?: string;
}

export function AgentStatusPanel({ agents, className }: AgentStatusPanelProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>AGENTS STATUS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
