'use client';

import { useEffect, useState } from 'react';
import { AgentPixelArt } from '@/components/agents/AgentPixelArt';
import { AgentCard } from '@/components/agents/AgentCard';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { MissionInput } from '@/components/mission/MissionInput';
import { TerminalLog } from '@/components/mission/TerminalLog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAgentStore, useMissionStore, useLogStore } from '@/lib/store';
import { AGENT_COLORS, AGENT_ROLES } from '@/lib/types';
import type { AgentId } from '@/lib/types';

export default function Home() {
  const agents = useAgentStore((state) => state.agents);
  const addAgent = useAgentStore((state) => state.addAgent);
  const setAgentStatus = useAgentStore((state) => state.setAgentStatus);

  const addMission = useMissionStore((state) => state.addMission);
  const setMissionStatus = useMissionStore((state) => state.setMissionStatus);

  const logs = useLogStore((state) => state.logs);
  const addSystemLog = useLogStore((state) => state.addSystemLog);
  const addMissionLog = useLogStore((state) => state.addMissionLog);
  const addAgentLog = useLogStore((state) => state.addAgentLog);
  const addCollabLog = useLogStore((state) => state.addCollabLog);
  const addCompleteLog = useLogStore((state) => state.addCompleteLog);
  const clearLogs = useLogStore((state) => state.clearLogs);

  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize agents on mount
  useEffect(() => {
    if (agents.length === 0) {
      const agentIds: AgentId[] = ['leo', 'momo', 'alex'];
      const zones = ['work', 'work', 'lounge'] as const;
      const statuses = ['WORKING', 'IDLE', 'RESTING'] as const;
      const stressLevels = [35, 15, 5];

      agentIds.forEach((id, index) => {
        addAgent({
          id,
          name: id.toUpperCase(),
          role: AGENT_ROLES[id],
          zone: zones[index],
          x: 100 + index * 150,
          y: 100,
          status: statuses[index],
          color: AGENT_COLORS[id],
          stressLevel: stressLevels[index],
        });
      });

      addSystemLog('SYSTEM INITIALIZED');
      addSystemLog('AGENTS LOADED [3/3]');
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

    // Agent analysis
    setTimeout(() => {
      setMissionStatus(missionId, 'processing');
      setAgentStatus('leo', 'WORKING');
      addAgentLog('leo', 'ANALYZING MISSION');
    }, 1000);

    // Team collaboration
    setTimeout(() => {
      setAgentStatus('momo', 'COMMUNICATING');
      setAgentStatus('alex', 'WORKING');
      addCollabLog('TEAM DISCUSSION ACTIVE');
    }, 2000);

    // Mission complete
    setTimeout(() => {
      setMissionStatus(missionId, 'completed');
      setAgentStatus('leo', 'IDLE');
      setAgentStatus('momo', 'IDLE');
      setAgentStatus('alex', 'IDLE');
      addCompleteLog('MISSION SUCCESS');
      setIsExecuting(false);
    }, 3500);
  };

  const handleClearLogs = () => {
    clearLogs();
    addSystemLog('LOGS CLEARED');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            My Office - Component Showcase
          </h1>
          <p className="text-muted-foreground">
            에이전트 픽셀 아트, 미션 입력, 터미널 로그 테스트
          </p>
        </div>

        <Separator />

        {/* Mission Input, Terminal Log & Agent Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MissionInput onExecute={handleExecute} isExecuting={isExecuting} />
          <TerminalLog logs={logs} onClear={handleClearLogs} />
          <AgentStatusPanel agents={agents} />
        </div>

        {/* Pixel Art Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Pixel Art - All States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* LEO */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#ff4444]">
                LEO (코드 마스터)
              </h3>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="leo" status="IDLE" />
                  <p className="text-sm text-muted-foreground">IDLE</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="leo" status="MOVING" />
                  <p className="text-sm text-muted-foreground">MOVING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="leo" status="WORKING" />
                  <p className="text-sm text-muted-foreground">WORKING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="leo" status="COMMUNICATING" />
                  <p className="text-sm text-muted-foreground">COMMUNICATING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="leo" status="RESTING" />
                  <p className="text-sm text-muted-foreground">RESTING</p>
                </div>
              </div>
            </div>

            {/* MOMO */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#ffaa00]">
                MOMO (기획 천재)
              </h3>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="momo" status="IDLE" />
                  <p className="text-sm text-muted-foreground">IDLE</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="momo" status="MOVING" />
                  <p className="text-sm text-muted-foreground">MOVING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="momo" status="WORKING" />
                  <p className="text-sm text-muted-foreground">WORKING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="momo" status="COMMUNICATING" />
                  <p className="text-sm text-muted-foreground">COMMUNICATING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="momo" status="RESTING" />
                  <p className="text-sm text-muted-foreground">RESTING</p>
                </div>
              </div>
            </div>

            {/* ALEX */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[#00ccff]">
                ALEX (분석가)
              </h3>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="alex" status="IDLE" />
                  <p className="text-sm text-muted-foreground">IDLE</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="alex" status="MOVING" />
                  <p className="text-sm text-muted-foreground">MOVING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="alex" status="WORKING" />
                  <p className="text-sm text-muted-foreground">WORKING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="alex" status="COMMUNICATING" />
                  <p className="text-sm text-muted-foreground">COMMUNICATING</p>
                </div>
                <div className="text-center space-y-2">
                  <AgentPixelArt agentId="alex" status="RESTING" />
                  <p className="text-sm text-muted-foreground">RESTING</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>✅ 에이전트 픽셀 아트 컴포넌트</p>
          <p>✅ 미션 입력 인터페이스</p>
          <p>✅ 터미널 로그 시스템</p>
          <p>✅ 에이전트 상태 패널</p>
          <p className="mt-4 font-mono">
            프로젝트 경로: D:\01_DevProjects\05_AgentTeam\my-office
          </p>
        </div>
      </div>
    </div>
  );
}
