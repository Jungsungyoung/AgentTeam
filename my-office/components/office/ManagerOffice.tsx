'use client';

import { useAgentStore } from '@/lib/store';
import { AgentPixelArt } from '@/components/agents/AgentPixelArt';
import type { Zone } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ManagerOfficeProps {
  className?: string;
  onNavigate?: (zone: Zone) => void;
}

const OFFICE_POSITION = {
  boss: { x: 275, y: 200 },
} as const;

export function ManagerOffice({ className, onNavigate }: ManagerOfficeProps) {
  const agents = useAgentStore((state) => state.agents);
  const bossAgent = agents.find((agent) => agent.id === 'boss');
  const isManaging = bossAgent?.status === 'MANAGING';

  return (
    <div
      className={cn(
        'flex flex-col w-[550px] h-[420px] bg-gradient-to-br from-[#3a2f52] to-[#2a1f42] rounded-xl overflow-hidden shadow-2xl relative',
        'border-2 transition-all duration-300',
        isManaging
          ? 'border-[#bb44ff] shadow-[0_0_50px_rgba(187,68,255,0.8)] animate-pulse'
          : 'border-[#bb44ff] hover:border-[#dd88ff] hover:shadow-[0_0_40px_rgba(187,68,255,0.5)]',
        className
      )}
    >
      {/* Corner Accent */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-[#bb44ff] opacity-30 blur-2xl" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#dd88ff] opacity-20 blur-2xl" />

      {/* Title Bar - Manager Style */}
      <div
        className={cn(
          'h-16 px-6 flex items-center justify-between shadow-lg transition-all',
          'bg-gradient-to-r from-[#bb44ff] via-[#9933dd] to-[#7722bb]'
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn('w-4 h-4 bg-yellow-300 rounded-full', isManaging && 'animate-ping')} />
          <span className="text-white font-black text-xl tracking-widest drop-shadow-lg">
            👑 MANAGER OFFICE
          </span>
        </div>
        <div className="text-white text-sm font-bold bg-white/20 px-4 py-1.5 rounded-full">
          총괄 매니저
        </div>
      </div>

      {/* Office Area */}
      <div className="relative flex-1 bg-[#1a1f2e]/60 backdrop-blur-sm">
        {/* Luxury Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(187,68,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(187,68,255,0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Authority Aura */}
        {isManaging && (
          <div className="absolute inset-0 bg-gradient-radial from-[#bb44ff]/15 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* Desk/Office Furniture Indicator */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-t from-[#7722bb]/30 to-transparent rounded-t-xl" />

        {bossAgent && (
          <div
            className="absolute transition-all duration-500 ease-out flex flex-col items-center gap-4"
            style={{
              left: `${bossAgent.x || OFFICE_POSITION.boss.x}px`,
              top: `${bossAgent.y || OFFICE_POSITION.boss.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Boss Pixel Art */}
            <div className="relative">
              <AgentPixelArt agentId={bossAgent.id} status={bossAgent.status} scale={5} />
              {/* Royal Glow Effect */}
              <div
                className={cn(
                  'absolute inset-0 -z-10 blur-2xl transition-opacity',
                  isManaging ? 'opacity-80' : 'opacity-50'
                )}
                style={{ backgroundColor: bossAgent.color }}
              />
            </div>

            {/* Boss Name with Crown */}
            <div className="text-lg font-black text-white whitespace-nowrap drop-shadow-[0_0_15px_rgba(187,68,255,0.8)] tracking-widest bg-gradient-to-r from-[#bb44ff]/40 to-[#dd88ff]/40 px-5 py-2 rounded-full border-2 border-[#bb44ff]">
              👑 {bossAgent.name}
            </div>

            {/* Status Badge - Premium */}
            <div
              className={cn(
                'text-sm font-black whitespace-nowrap px-4 py-2 rounded-lg border-2',
                bossAgent.status === 'MANAGING' &&
                  'bg-gradient-to-r from-[#bb44ff] to-[#9933dd] text-white border-white animate-pulse shadow-[0_0_20px_rgba(187,68,255,0.8)]',
                bossAgent.status === 'WORKING' &&
                  'bg-gradient-to-r from-[#ff4466] to-[#dd2244] text-white border-white',
                bossAgent.status === 'IDLE' && 'bg-[#00ff88] text-black border-[#00ff88]',
                bossAgent.status === 'COMMUNICATING' &&
                  'bg-[#00ddff] text-black border-[#00ddff] animate-pulse'
              )}
            >
              {bossAgent.status === 'MANAGING' && '🎯 총괄 관리 중'}
              {bossAgent.status === 'WORKING' && '📊 업무 처리'}
              {bossAgent.status === 'IDLE' && '✓ 대기 중'}
              {bossAgent.status === 'COMMUNICATING' && '💬 지시 전달'}
            </div>
          </div>
        )}

        {/* Status Banner */}
        {isManaging && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <div className="text-base font-black text-[#bb44ff] animate-pulse drop-shadow-[0_0_15px_rgba(187,68,255,1)] tracking-wider bg-white/10 px-8 py-3 rounded-full border-2 border-[#bb44ff]">
              ⚡ 팀 전체 통합 관리 중 ⚡
            </div>
          </div>
        )}
      </div>

      {/* Button Area */}
      <div className="h-14 flex items-center justify-center border-t-2 border-[#4a3f62] bg-[#1a1f2e]/80 backdrop-blur-sm">
        <button
          onClick={() => onNavigate?.('office')}
          className="px-6 py-2 text-base font-bold text-white bg-gradient-to-r from-[#bb44ff] to-[#9933dd] hover:from-[#dd88ff] hover:to-[#bb44ff] transition-all rounded-lg shadow-lg hover:shadow-[0_0_25px_rgba(187,68,255,0.8)] hover:scale-105 active:scale-95"
        >
          [👑 MANAGER MODE]
        </button>
      </div>
    </div>
  );
}
