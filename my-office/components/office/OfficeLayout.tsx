'use client';

import { useAgentStore } from '@/lib/store';
import { WorkZone } from './WorkZone';
import { MeetingRoom } from './MeetingRoom';
import { Lounge } from './Lounge';
import type { Zone } from '@/lib/types';

interface OfficeLayoutProps {
  className?: string;
}

export function OfficeLayout({ className }: OfficeLayoutProps) {
  const { agents, setAgentZone, setAgentStatus } = useAgentStore();

  const handleNavigate = (targetZone: Zone) => {
    agents.forEach((agent) => {
      setAgentStatus(agent.id, 'MOVING');

      setTimeout(() => {
        setAgentZone(agent.id, targetZone);
        setAgentStatus(agent.id, 'IDLE');
      }, 500);
    });
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <WorkZone onNavigate={handleNavigate} />
        <MeetingRoom onNavigate={handleNavigate} />
        <Lounge onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
