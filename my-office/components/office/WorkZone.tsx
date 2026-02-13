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
  boss: { x: 420, y: 100 },
  leo: { x: 120, y: 100 },
  momo: { x: 320, y: 100 },
  alex: { x: 220, y: 240 },
} as const;

export function WorkZone({ className, onNavigate }: WorkZoneProps) {
  const agents = useAgentStore((state) => state.agents);
  const workAgents = agents.filter((agent) => agent.zone === 'work');

  return (
    <div
      className={cn(
        'flex flex-col w-[550px] h-[420px] bg-gradient-to-br from-[#2a2f42] to-[#1f2434] rounded-xl overflow-hidden shadow-2xl relative',
        'border-2 border-[#ff4466] hover:border-[#ff6688] transition-all duration-300',
        'hover:shadow-[0_0_40px_rgba(255,68,102,0.4)]',
        className
      )}
    >
      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff4466] opacity-20 blur-2xl" />

      {/* Title Bar */}
      <div className="h-14 bg-gradient-to-r from-[#ff4466] to-[#ff6688] px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-white font-black text-lg tracking-widest drop-shadow-md">
            ◼ WORK ZONE
          </span>
        </div>
        <div className="text-white text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
          {workAgents.length} / 3
        </div>
      </div>

      {/* Agent Area */}
      <div className="relative flex-1 bg-[#1a1f2e]/50 backdrop-blur-sm">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {workAgents.map((agent) => {
          const position = WORK_ZONE_POSITIONS[agent.id];

          return (
            <div
              key={agent.id}
              className="absolute transition-all duration-500 ease-out flex flex-col items-center gap-3"
              style={{
                left: `${agent.x || position.x}px`,
                top: `${agent.y || position.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Agent Pixel Art */}
              <div className="relative">
                <AgentPixelArt
                  agentId={agent.id}
                  status={agent.status}
                  scale={4}
                />
                {/* Glow Effect */}
                <div
                  className="absolute inset-0 -z-10 blur-xl opacity-40"
                  style={{ backgroundColor: agent.color }}
                />
              </div>

              {/* Agent Name */}
              <div className="text-sm font-bold text-white whitespace-nowrap drop-shadow-lg tracking-wider bg-black/40 px-3 py-1 rounded-full border border-white/20">
                {agent.name}
              </div>

              {/* Status Badge */}
              <div className={cn(
                "text-xs font-bold whitespace-nowrap px-2 py-1 rounded-md",
                agent.status === 'WORKING' && "bg-[#ff4466] text-white animate-pulse",
                agent.status === 'IDLE' && "bg-[#00ff88] text-black",
                agent.status === 'MOVING' && "bg-[#ffbb33] text-black animate-bounce"
              )}>
                {agent.status === 'WORKING' && '⚡ CODING'}
                {agent.status === 'IDLE' && '✓ READY'}
                {agent.status === 'MOVING' && '→ MOVING'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Button Area */}
      <div className="h-14 flex items-center justify-center border-t-2 border-[#3a3f52] bg-[#1a1f2e]/80 backdrop-blur-sm">
        <button
          onClick={() => onNavigate?.('work')}
          className="px-6 py-2 text-base font-bold text-white bg-gradient-to-r from-[#ff4466] to-[#ff6688] hover:from-[#ff6688] hover:to-[#ff4466] transition-all rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(255,68,102,0.6)] hover:scale-105 active:scale-95"
        >
          [▶ SEND TO WORK]
        </button>
      </div>
    </div>
  );
}
