'use client';

import { useEffect, useState } from 'react';
import { OfficeLayout } from '@/components/office/OfficeLayout';
import { MissionInput } from '@/components/mission/MissionInput';
import { TerminalLog } from '@/components/mission/TerminalLog';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { DeliverablePanel } from '@/components/deliverables';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ConversationTimeline } from '@/components/conversation/ConversationTimeline';
import { useAgentStore, useMissionStore, useLogStore } from '@/lib/store';
import { useClaudeTeam } from '@/lib/hooks/useClaudeTeam';
import { AGENT_COLORS, AGENT_ROLES } from '@/lib/types';
import type { AgentId } from '@/lib/types';

export default function OfficePage() {
  const agents = useAgentStore((state) => state.agents);
  const addAgent = useAgentStore((state) => state.addAgent);
  const setAgentStatus = useAgentStore((state) => state.setAgentStatus);
  const setAgentZone = useAgentStore((state) => state.setAgentZone);

  const addMission = useMissionStore((state) => state.addMission);
  const setMissionStatus = useMissionStore((state) => state.setMissionStatus);
  const currentMissionId = useMissionStore((state) => state.currentMissionId);

  const logs = useLogStore((state) => state.logs);
  const addSystemLog = useLogStore((state) => state.addSystemLog);
  const addMissionLog = useLogStore((state) => state.addMissionLog);
  const addAgentLog = useLogStore((state) => state.addAgentLog);
  const addCollabLog = useLogStore((state) => state.addCollabLog);
  const addCompleteLog = useLogStore((state) => state.addCompleteLog);
  const clearLogs = useLogStore((state) => state.clearLogs);

  const [isExecuting, setIsExecuting] = useState(false);

  // Chat functionality from useClaudeTeam hook
  const {
    sendChatMessage,
    chatMessages,
    selectedChatAgent,
    setSelectedChatAgent,
    isSendingChat,
    isConnected,
    collaborationEvents,
  } = useClaudeTeam();

  // Initialize agents on mount
  useEffect(() => {
    if (agents.length === 0) {
      // Initialize BOSS first
      addAgent({
        id: 'boss',
        name: 'BOSS',
        role: AGENT_ROLES['boss'],
        zone: 'office',
        x: 0,
        y: 0,
        status: 'IDLE',
        color: AGENT_COLORS['boss'],
        stressLevel: 0,
        isManager: true,
      });

      // Initialize workers
      const workerIds: AgentId[] = ['leo', 'momo', 'alex'];
      workerIds.forEach((id) => {
        addAgent({
          id,
          name: id.toUpperCase(),
          role: AGENT_ROLES[id],
          zone: 'work',
          x: 0,
          y: 0,
          status: 'IDLE',
          color: AGENT_COLORS[id],
          stressLevel: 0,
          isManager: false,
        });
      });

      addSystemLog('SYSTEM INITIALIZED');
      addSystemLog('MANAGER: 1 | WORKERS: 3');
      addSystemLog('ALL AGENTS LOADED [4/4]');
    }
  }, [agents.length, addAgent, addSystemLog]);

  const handleExecute = (mission: string) => {
    // Create mission
    const missionId = crypto.randomUUID();
    addMission({
      id: missionId,
      content: mission,
      status: 'pending',
      assignedAgents: [],
      createdAt: new Date(),
    });

    // Log mission
    addMissionLog(mission);
    setIsExecuting(true);

    // Step 1: BOSS analyzes mission (300ms)
    setTimeout(() => {
      setAgentStatus('boss', 'MANAGING');
      addAgentLog('boss', '🎯 미션 분석 중...');
    }, 300);

    // Step 2: BOSS gives instructions (1000ms)
    setTimeout(() => {
      setMissionStatus(missionId, 'processing');
      addAgentLog('boss', '📋 팀원들에게 업무 할당');
      addSystemLog('>>> BOSS → LEO: 코드 구현 담당');
      addSystemLog('>>> BOSS → MOMO: 기획/설계 담당');
      addSystemLog('>>> BOSS → ALEX: 분석/검증 담당');
    }, 1000);

    // Step 3: LEO moves to meeting room (1500ms)
    setTimeout(() => {
      setAgentStatus('leo', 'MOVING');
      addAgentLog('leo', 'Moving to meeting room...');
    }, 1500);

    setTimeout(() => {
      setAgentZone('leo', 'meeting');
      setAgentStatus('leo', 'IDLE');
    }, 2000);

    // Step 4: MOMO moves to meeting room (1800ms)
    setTimeout(() => {
      setAgentStatus('momo', 'MOVING');
      addAgentLog('momo', 'Moving to meeting room...');
    }, 1800);

    setTimeout(() => {
      setAgentZone('momo', 'meeting');
      setAgentStatus('momo', 'IDLE');
    }, 2300);

    // Step 5: Team collaboration starts (2500ms)
    setTimeout(() => {
      setAgentStatus('leo', 'COMMUNICATING');
      setAgentStatus('momo', 'COMMUNICATING');
      setAgentStatus('boss', 'COMMUNICATING');
      addCollabLog('TEAM COLLABORATION ACTIVE');
    }, 2500);

    // Step 6: ALEX joins analysis (3000ms)
    setTimeout(() => {
      setAgentStatus('alex', 'WORKING');
      addAgentLog('alex', 'Analyzing requirements...');
    }, 3000);

    // Step 7: BOSS monitors progress (3500ms)
    setTimeout(() => {
      setAgentStatus('boss', 'MANAGING');
      addAgentLog('boss', '📊 진행 상황 모니터링');
    }, 3500);

    // Step 8: Complete mission (4500ms)
    setTimeout(() => {
      setMissionStatus(missionId, 'completed');
      setAgentStatus('boss', 'IDLE');
      addCompleteLog('MISSION SUCCESS');
      addAgentLog('boss', '✅ 업무 완료 확인');

      // Return to work zone
      setTimeout(() => {
        setAgentStatus('leo', 'MOVING');
        setAgentStatus('momo', 'MOVING');
      }, 500);

      setTimeout(() => {
        setAgentZone('leo', 'work');
        setAgentZone('momo', 'work');
        setAgentStatus('leo', 'IDLE');
        setAgentStatus('momo', 'IDLE');
        setAgentStatus('alex', 'IDLE');
        setIsExecuting(false);
      }, 1000);
    }, 4500);
  };

  const handleClearLogs = () => {
    clearLogs();
    addSystemLog('LOGS CLEARED');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c3344] via-[#353b50] to-[#2c3344] p-8 relative overflow-hidden">
      {/* CRT Scan Lines Effect - Less Opacity */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px)]" />

      {/* Ambient Glow - Brighter */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ddff] opacity-8 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff4466] opacity-8 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1800px] space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-block">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ddff] via-[#00ff88] to-[#ffbb33] tracking-wider drop-shadow-[0_0_20px_rgba(0,255,136,0.5)] animate-pulse">
              MY OFFICE
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent mt-2" />
          </div>
          <p className="text-[#00ff88] font-bold text-xl tracking-wide drop-shadow-[0_0_10px_rgba(0,255,136,0.8)]">
            ⚡ AI AGENT COLLABORATION VISUALIZER ⚡
          </p>
          <p className="text-[#8899aa] text-sm">
            [ PIXEL ART EDITION • PHASE 1 MVP ]
          </p>
        </div>

        {/* Top Controls - Much More Spacious */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
          <MissionInput onExecute={handleExecute} isExecuting={isExecuting} />
          <TerminalLog logs={logs} onClear={handleClearLogs} />
          <AgentStatusPanel agents={agents} />
        </div>

        {/* Office Layout - Main Feature */}
        <div className="flex justify-center mb-12">
          <OfficeLayout />
        </div>

        {/* Bottom Section: Chat + Deliverables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
          {/* Chat Panel */}
          <div className="h-[600px]">
            <ChatPanel
              missionId={currentMissionId}
              messages={chatMessages}
              selectedAgent={selectedChatAgent}
              onSelectAgent={setSelectedChatAgent}
              onSendMessage={sendChatMessage}
              isSending={isSendingChat}
              isConnected={isConnected}
            />
          </div>

          {/* Deliverables Panel */}
          <div className="h-[600px]">
            <DeliverablePanel />
          </div>
        </div>

        {/* Conversation Timeline */}
        <div className="mb-12">
          <ConversationTimeline collaborationEvents={collaborationEvents || []} />
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-4 text-[#8899aa] font-medium text-sm border-t-2 border-[#4a4f62] pt-8">
          {/* Agent Structure */}
          <div className="flex justify-center items-center gap-6 text-base">
            <div className="flex items-center gap-2 bg-[#bb44ff]/10 px-4 py-2 rounded-full border border-[#bb44ff]">
              <div className="w-3 h-3 bg-[#bb44ff] rounded-full animate-pulse" />
              <span className="text-[#bb44ff] font-bold">총괄 매니저: 1명</span>
            </div>
            <span className="text-[#4a4f62] text-2xl">→</span>
            <div className="flex items-center gap-2 bg-[#ff4466]/10 px-4 py-2 rounded-full border border-[#ff4466]">
              <div className="w-3 h-3 bg-[#ff4466] rounded-full" />
              <span className="text-white font-bold">팀원: 3명</span>
            </div>
          </div>

          {/* Phase Info */}
          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
              <span>Phase 1: 계층형 협업 시뮬레이션</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#ffbb33] rounded-full animate-pulse" />
              <span>Phase 2: Claude API 통합 (예정)</span>
            </div>
          </div>

          {/* CTA */}
          <p className="text-[#00ddff] text-lg font-bold mt-4 animate-pulse drop-shadow-[0_0_10px_rgba(0,221,255,0.6)]">
            🚀 EXECUTE를 눌러 매니저-팀원 협업을 확인하세요! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
