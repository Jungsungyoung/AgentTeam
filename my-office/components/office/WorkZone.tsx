'use client';

import { useAgentStore } from '@/lib/store';
import { AgentPixelArt } from '@/components/agents/AgentPixelArt';
import type { Zone } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WorkZoneProps {
  className?: string;
  onNavigate?: (zone: Zone) => void;
}

const WORK_ZONE_POSITIONS = {
  leo: { x: 80, y: 60 },
  momo: { x: 240, y: 60 },
  alex: { x: 160, y: 160 },
} as const;

export function WorkZone({ className, onNavigate }: WorkZoneProps) {
  const agents = useAgentStore((state) => state.agents);
  const workAgents = agents.filter((agent) => agent.zone === 'work');

  return (
    <div
      className={cn(
        'flex flex-col w-[400px] h-[320px] bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Title Bar */}
      <div className="h-10 bg-[#16213e] px-4 flex items-center">
        <span className="text-white font-semibold text-sm">
          ◼◼ WORK ZONE ◼◼
        </span>
      </div>

      {/* Agent Area */}
      <div className="relative flex-1 h-[260px]">
        {workAgents.map((agent) => {
          const position = WORK_ZONE_POSITIONS[agent.id];

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
              <div className="text-xs text-[#707080] whitespace-nowrap">
                {agent.status === 'WORKING' && 'Coding...'}
                {agent.status === 'IDLE' && 'Ready...'}
                {agent.status === 'MOVING' && 'Moving...'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Button Area */}
      <div className="h-10 flex items-center justify-center border-t border-[#2a2a3e]">
        <button
          onClick={() => onNavigate?.('work')}
          className="px-4 py-1 text-sm text-[#00ccff] hover:text-white hover:bg-[#2a2a3e] transition-colors rounded"
        >
          [▶ TO WORK]
        </button>
      </div>
    </div>
  );
}
