'use client';

import { useAgentStore } from '@/lib/store';
import { ManagerOffice } from './ManagerOffice';
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
      // Skip boss agent for mass navigation
      if (agent.id === 'boss') return;

      setAgentStatus(agent.id, 'MOVING');

      setTimeout(() => {
        setAgentZone(agent.id, targetZone);
        setAgentStatus(agent.id, 'IDLE');
      }, 500);
    });
  };

  return (
    <div className={className}>
      <div className="space-y-8">
        {/* Manager Office - Top Section */}
        <div className="flex justify-center">
          <ManagerOffice onNavigate={handleNavigate} />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#4a4f62]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-r from-[#2c3344] via-[#353b50] to-[#2c3344] px-6 py-2 text-sm font-bold text-[#8899aa] tracking-widest">
              ⬇️ TEAM WORKSPACE ⬇️
            </span>
          </div>
        </div>

        {/* Employee Zones - Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <WorkZone onNavigate={handleNavigate} />
          <MeetingRoom onNavigate={handleNavigate} />
          <Lounge onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
}
