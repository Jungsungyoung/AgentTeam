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
  boss: { x: 70, y: 180 },
  leo: { x: 140, y: 120 },
  momo: { x: 280, y: 180 },
  alex: { x: 420, y: 140 },
} as const;

export function Lounge({ className, onNavigate }: LoungeProps) {
  const agents = useAgentStore((state) => state.agents);
  const loungeAgents = agents.filter((agent) => agent.zone === 'lounge');
  const isResting = loungeAgents.some((agent) => agent.status === 'RESTING');

  return (
    <div
      className={cn(
        'flex flex-col w-[550px] h-[420px] bg-gradient-to-br from-[#2a2f42] to-[#1f2434] rounded-xl overflow-hidden shadow-2xl relative',
        'border-2 border-[#ffbb33] hover:border-[#ffdd55] transition-all duration-300',
        'hover:shadow-[0_0_40px_rgba(255,187,51,0.4)]',
        className
      )}
    >
      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-[#ffbb33] opacity-20 blur-2xl" />

      {/* Title Bar */}
      <div className="h-14 bg-gradient-to-r from-[#ffbb33] to-[#ffaa00] px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-white font-black text-lg tracking-widest drop-shadow-md">
            ◼ LOUNGE
          </span>
        </div>
        <div className="text-white text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
          {loungeAgents.length} / 3
        </div>
      </div>

      {/* Lounge Area */}
      <div className="relative flex-1 bg-[#1a1f2e]/50 backdrop-blur-sm">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,187,51,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,187,51,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Relaxing Atmosphere Effect */}
        {isResting && (
          <div className="absolute inset-0 bg-gradient-radial from-[#ffbb33]/5 to-transparent pointer-events-none" />
        )}

        {loungeAgents.map((agent) => {
          const position = LOUNGE_POSITIONS[agent.id];

          return (
            <div
              key={agent.id}
              className="absolute transition-all duration-700 ease-in-out flex flex-col items-center gap-3"
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
                {/* Soft Glow Effect */}
                <div
                  className="absolute inset-0 -z-10 blur-xl opacity-30"
                  style={{ backgroundColor: agent.color }}
                />
              </div>

              {/* Agent Name */}
              <div className="text-sm font-bold text-white whitespace-nowrap drop-shadow-lg tracking-wider bg-black/40 px-3 py-1 rounded-full border border-white/20">
                {agent.name}
              </div>

              {/* Status Badge */}
              <div
                className={cn(
                  'text-xs font-bold whitespace-nowrap px-2 py-1 rounded-md',
                  agent.status === 'RESTING' &&
                    'bg-[#ffbb33] text-black animate-pulse',
                  agent.status === 'IDLE' && 'bg-[#00ff88] text-black',
                  agent.status === 'MOVING' &&
                    'bg-[#00ddff] text-black animate-bounce'
                )}
              >
                {agent.status === 'RESTING' && '😴 RESTING'}
                {agent.status === 'IDLE' && '✓ READY'}
                {agent.status === 'MOVING' && '→ MOVING'}
              </div>
            </div>
          );
        })}

        {/* Resting Status Banner */}
        {isResting && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="text-lg font-black text-[#ffbb33] animate-pulse drop-shadow-[0_0_10px_rgba(255,187,51,0.8)] tracking-wider bg-black/60 px-6 py-2 rounded-full border-2 border-[#ffbb33]">
              ☕ RELAXATION MODE ☕
            </div>
          </div>
        )}

        {/* Empty State */}
        {loungeAgents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="text-4xl">☕</div>
              <p className="text-[#8899aa] text-sm font-medium">
                No agents in lounge
              </p>
              <p className="text-[#556677] text-xs">
                Send agents here to rest and reduce stress
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Button Area */}
      <div className="h-14 flex items-center justify-center border-t-2 border-[#3a3f52] bg-[#1a1f2e]/80 backdrop-blur-sm">
        <button
          onClick={() => onNavigate?.('lounge')}
          className="px-6 py-2 text-base font-bold text-white bg-gradient-to-r from-[#ffbb33] to-[#ffaa00] hover:from-[#ffaa00] hover:to-[#ffbb33] transition-all rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(255,187,51,0.6)] hover:scale-105 active:scale-95"
        >
          [▶ SEND TO LOUNGE]
        </button>
      </div>
    </div>
  );
}
