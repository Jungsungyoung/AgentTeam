'use client';

import { useAgentStore } from '@/lib/store';
import { AgentPixelArt } from '@/components/agents/AgentPixelArt';
import type { Zone } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MeetingRoomProps {
  className?: string;
  onNavigate?: (zone: Zone) => void;
}

const MEETING_POSITIONS = {
  leo: { x: 140, y: 100 },
  momo: { x: 220, y: 100 },
  alex: { x: 180, y: 160 },
} as const;

export function MeetingRoom({ className, onNavigate }: MeetingRoomProps) {
  const agents = useAgentStore((state) => state.agents);
  const meetingAgents = agents.filter((agent) => agent.zone === 'meeting');
  const isMeetingActive = meetingAgents.some(
    (agent) => agent.status === 'COMMUNICATING'
  );

  return (
    <div
      className={cn(
        'flex flex-col w-[400px] h-[320px] bg-[#1a1a2e] border-2 rounded-lg overflow-hidden',
        isMeetingActive ? 'border-[#ff4444]' : 'border-[#2a2a3e]',
        className
      )}
    >
      {/* Title Bar */}
      <div className="h-10 bg-[#16213e] px-4 flex items-center">
        <span className="text-white font-semibold text-sm">
          ◼◼ MEETING ROOM ◼◼
        </span>
      </div>

      {/* Meeting Area */}
      <div className="relative flex-1 h-[260px]">
        {meetingAgents.map((agent) => {
          const position = MEETING_POSITIONS[agent.id];

          return (
            <div
              key={agent.id}
              className="absolute transition-all duration-500 ease-out flex flex-col items-center gap-2"
              style={{
                left: `${agent.x || position.x}px`,
                top: `${agent.y || position.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <AgentPixelArt
                agentId={agent.id}
                status={agent.status}
                scale={3}
              />
              <div className="text-xs text-[#b0b0c0] whitespace-nowrap">
                {agent.name}
              </div>
            </div>
          );
        })}

        {/* Collaboration Status */}
        {isMeetingActive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="text-sm text-[#00ff88] animate-pulse">
              [협업 진행 중...]
            </div>
          </div>
        )}
      </div>

      {/* Button Area */}
      <div className="h-10 flex items-center justify-center border-t border-[#2a2a3e]">
        <button
          onClick={() => onNavigate?.('meeting')}
          className="px-4 py-1 text-sm text-[#00ccff] hover:text-white hover:bg-[#2a2a3e] transition-colors rounded"
        >
          [▶ TO MEETING]
        </button>
      </div>
    </div>
  );
}
