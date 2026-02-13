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
  boss: { x: 80, y: 140 },
  leo: { x: 200, y: 140 },
  momo: { x: 320, y: 140 },
  alex: { x: 260, y: 260 },
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
        'flex flex-col w-[550px] h-[420px] bg-gradient-to-br from-[#2a2f42] to-[#1f2434] rounded-xl overflow-hidden shadow-2xl relative',
        'border-2 transition-all duration-300',
        isMeetingActive
          ? 'border-[#00ff88] shadow-[0_0_40px_rgba(0,255,136,0.6)] animate-pulse'
          : 'border-[#00ddff] hover:border-[#00ffff] hover:shadow-[0_0_40px_rgba(0,221,255,0.4)]',
        className
      )}
    >
      {/* Corner Accent */}
      <div
        className={cn(
          'absolute top-0 right-0 w-16 h-16 opacity-20 blur-2xl transition-colors',
          isMeetingActive ? 'bg-[#00ff88]' : 'bg-[#00ddff]'
        )}
      />

      {/* Title Bar */}
      <div
        className={cn(
          'h-14 px-6 flex items-center justify-between shadow-lg transition-all',
          isMeetingActive
            ? 'bg-gradient-to-r from-[#00ff88] to-[#00ddff]'
            : 'bg-gradient-to-r from-[#00ddff] to-[#0099ff]'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-3 h-3 bg-white rounded-full',
              isMeetingActive && 'animate-ping'
            )}
          />
          <span className="text-white font-black text-lg tracking-widest drop-shadow-md">
            ◼ MEETING ROOM
          </span>
        </div>
        <div className="text-white text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
          {meetingAgents.length} / 3
        </div>
      </div>

      {/* Meeting Area */}
      <div className="relative flex-1 bg-[#1a1f2e]/50 backdrop-blur-sm">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Collaboration Indicator */}
        {isMeetingActive && (
          <div className="absolute inset-0 bg-gradient-radial from-[#00ff88]/10 to-transparent animate-pulse pointer-events-none" />
        )}

        {meetingAgents.map((agent) => {
          const position = MEETING_POSITIONS[agent.id];

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
                {/* Enhanced Glow Effect for Active Collaboration */}
                <div
                  className={cn(
                    'absolute inset-0 -z-10 blur-xl transition-opacity',
                    isMeetingActive ? 'opacity-60' : 'opacity-40'
                  )}
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
                  agent.status === 'COMMUNICATING' &&
                    'bg-[#00ff88] text-black animate-pulse',
                  agent.status === 'IDLE' && 'bg-[#00ddff] text-black',
                  agent.status === 'MOVING' &&
                    'bg-[#ffbb33] text-black animate-bounce'
                )}
              >
                {agent.status === 'COMMUNICATING' && '💬 TALKING'}
                {agent.status === 'IDLE' && '✓ READY'}
                {agent.status === 'MOVING' && '→ MOVING'}
              </div>
            </div>
          );
        })}

        {/* Collaboration Status Banner */}
        {isMeetingActive && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="text-lg font-black text-[#00ff88] animate-pulse drop-shadow-[0_0_10px_rgba(0,255,136,0.8)] tracking-wider bg-black/60 px-6 py-2 rounded-full border-2 border-[#00ff88]">
              ⚡ COLLABORATION IN PROGRESS ⚡
            </div>
          </div>
        )}
      </div>

      {/* Button Area */}
      <div className="h-14 flex items-center justify-center border-t-2 border-[#3a3f52] bg-[#1a1f2e]/80 backdrop-blur-sm">
        <button
          onClick={() => onNavigate?.('meeting')}
          className={cn(
            'px-6 py-2 text-base font-bold text-white transition-all rounded-lg shadow-lg hover:scale-105 active:scale-95',
            isMeetingActive
              ? 'bg-gradient-to-r from-[#00ff88] to-[#00ddff] hover:from-[#00ddff] hover:to-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,136,0.6)]'
              : 'bg-gradient-to-r from-[#00ddff] to-[#0099ff] hover:from-[#0099ff] hover:to-[#00ddff] hover:shadow-[0_0_20px_rgba(0,221,255,0.6)]'
          )}
        >
          [▶ SEND TO MEETING]
        </button>
      </div>
    </div>
  );
}
