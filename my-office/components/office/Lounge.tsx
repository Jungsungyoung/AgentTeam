'use client';

import { useAgentStore } from '@/lib/store';
import { AgentPixelArt } from '@/components/agents/AgentPixelArt';
import type { Zone } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LoungeProps {
  className?: string;
  onNavigate?: (zone: Zone) => void;
}

const LOUNGE_POSITIONS = {
  leo: { x: 100, y: 80 },
  momo: { x: 200, y: 140 },
  alex: { x: 300, y: 100 },
} as const;

export function Lounge({ className, onNavigate }: LoungeProps) {
  const agents = useAgentStore((state) => state.agents);
  const loungeAgents = agents.filter((agent) => agent.zone === 'lounge');
  const isResting = loungeAgents.some((agent) => agent.status === 'RESTING');

  return (
    <div
      className={cn(
        'flex flex-col w-[400px] h-[320px] bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Title Bar */}
      <div className="h-10 bg-[#16213e] px-4 flex items-center">
        <span className="text-white font-semibold text-sm">◼◼ LOUNGE ◼◼</span>
      </div>

      {/* Lounge Area */}
      <div className="relative flex-1 h-[260px]">
        {loungeAgents.map((agent) => {
          const position = LOUNGE_POSITIONS[agent.id];

          return (
            <div
              key={agent.id}
              className="absolute transition-all duration-700 ease-in-out"
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
            </div>
          );
        })}

        {/* Resting Status */}
        {isResting && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="text-sm text-[#00ff88]">[ 휴식 중 ]</div>
          </div>
        )}
      </div>

      {/* Button Area */}
      <div className="h-10 flex items-center justify-center border-t border-[#2a2a3e]">
        <button
          onClick={() => onNavigate?.('lounge')}
          className="px-4 py-1 text-sm text-[#00ccff] hover:text-white hover:bg-[#2a2a3e] transition-colors rounded"
        >
          [▶ TO LOUNGE]
        </button>
      </div>
    </div>
  );
}
