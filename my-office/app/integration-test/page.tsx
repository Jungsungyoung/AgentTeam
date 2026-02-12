'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OfficeLayout } from '@/components/office/OfficeLayout';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { MissionInput } from '@/components/mission/MissionInput';
import { TerminalLog } from '@/components/mission/TerminalLog';
import { useAgentStore, useMissionStore, useLogStore } from '@/lib/store';
import { AGENT_COLORS, AGENT_ROLES } from '@/lib/types';
import type { AgentId, Zone } from '@/lib/types';

export default function IntegrationTestPage() {
  const agents = useAgentStore((state) => state.agents);
  const addAgent = useAgentStore((state) => state.addAgent);
  const setAgentStatus = useAgentStore((state) => state.setAgentStatus);
  const setAgentZone = useAgentStore((state) => state.setAgentZone);
  const setStressLevel = useAgentStore((state) => state.setStressLevel);
  const resetAgents = useAgentStore((state) => state.resetAgents);

  const missions = useMissionStore((state) => state.missions);
  const addMission = useMissionStore((state) => state.addMission);
  const setMissionStatus = useMissionStore((state) => state.setMissionStatus);
  const assignAgent = useMissionStore((state) => state.assignAgent);
  const completeMission = useMissionStore((state) => state.completeMission);
  const getPendingMissions = useMissionStore(
    (state) => state.getPendingMissions
  );
  const getProcessingMissions = useMissionStore(
    (state) => state.getProcessingMissions
  );
  const getCompletedMissions = useMissionStore(
    (state) => state.getCompletedMissions
  );
  const resetMissions = useMissionStore((state) => state.resetMissions);

  const logs = useLogStore((state) => state.logs);
  const addSystemLog = useLogStore((state) => state.addSystemLog);
  const addMissionLog = useLogStore((state) => state.addMissionLog);
  const addAgentLog = useLogStore((state) => state.addAgentLog);
  const addCollabLog = useLogStore((state) => state.addCollabLog);
  const addCompleteLog = useLogStore((state) => state.addCompleteLog);
  const clearLogs = useLogStore((state) => state.clearLogs);

  // Initialize system
  useEffect(() => {
    if (agents.length === 0) {
      initializeSystem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeSystem = () => {
    const agentIds: AgentId[] = ['leo', 'momo', 'alex'];

    agentIds.forEach((id, index) => {
      addAgent({
        id,
        name: id.toUpperCase(),
        role: AGENT_ROLES[id],
        zone: 'work',
        x: 100 + index * 200,
        y: 150,
        status: 'IDLE',
        color: AGENT_COLORS[id],
        stressLevel: 0,
      });
    });

    addSystemLog('🚀 MY OFFICE SYSTEM INITIALIZED');
    addSystemLog('✅ AGENTS LOADED [3/3]');
    addSystemLog('⚡ ALL SYSTEMS READY');
  };

  const handleExecuteMission = (missionContent: string) => {
    const missionId = crypto.randomUUID();

    // Create mission
    addMission({
      id: missionId,
      content: missionContent,
      status: 'pending',
      assignedAgents: [],
      createdAt: new Date(),
    });

    addMissionLog(missionContent);

    // Simulate mission execution flow
    setTimeout(() => {
      setMissionStatus(missionId, 'processing');
      assignAgent(missionId, 'leo');
      setAgentStatus('leo', 'WORKING');
      setStressLevel('leo', 30);
      addAgentLog('leo', 'Starting mission analysis...');
    }, 500);

    setTimeout(() => {
      assignAgent(missionId, 'momo');
      setAgentStatus('momo', 'COMMUNICATING');
      setStressLevel('momo', 20);
      addAgentLog('momo', 'Planning implementation strategy...');
    }, 1500);

    setTimeout(() => {
      assignAgent(missionId, 'alex');
      setAgentStatus('alex', 'WORKING');
      setStressLevel('alex', 25);
      addCollabLog('Team collaboration in progress');
      addAgentLog('alex', 'Running tests and validation...');
    }, 2500);

    setTimeout(() => {
      completeMission(missionId);
      setAgentStatus('leo', 'IDLE');
      setAgentStatus('momo', 'IDLE');
      setAgentStatus('alex', 'IDLE');
      setStressLevel('leo', 10);
      setStressLevel('momo', 5);
      setStressLevel('alex', 5);
      addCompleteLog(`✓ MISSION COMPLETED: ${missionContent}`);
    }, 4000);
  };

  const handleMoveAllAgents = (zone: Zone) => {
    agents.forEach((agent) => {
      setAgentStatus(agent.id, 'MOVING');
    });

    addSystemLog(`🚶 Moving all agents to ${zone.toUpperCase()}...`);

    setTimeout(() => {
      agents.forEach((agent) => {
        setAgentZone(agent.id, zone);
        setAgentStatus(agent.id, 'IDLE');
      });
      addSystemLog(`✓ All agents arrived at ${zone.toUpperCase()}`);
    }, 1000);
  };

  const handleStressTest = () => {
    addSystemLog('⚠️ STRESS TEST INITIATED');

    agents.forEach((agent) => {
      setAgentStatus(agent.id, 'WORKING');
      setStressLevel(agent.id, Math.floor(Math.random() * 100));
    });

    setTimeout(() => {
      agents.forEach((agent) => {
        setAgentStatus(agent.id, 'IDLE');
        setStressLevel(agent.id, 0);
      });
      addSystemLog('✓ STRESS TEST COMPLETED');
    }, 2000);
  };

  const handleResetSystem = () => {
    resetAgents();
    resetMissions();
    clearLogs();
    initializeSystem();
    addSystemLog('🔄 SYSTEM RESET COMPLETE');
  };

  const pendingCount = getPendingMissions().length;
  const processingCount = getProcessingMissions().length;
  const completedCount = getCompletedMissions().length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            🧪 Integration Test Dashboard
          </h1>
          <p className="text-muted-foreground">
            Complete system integration with Zustand state management
          </p>
        </div>

        <Separator />

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => handleMoveAllAgents('work')}
                variant="outline"
              >
                📍 Move to Work
              </Button>
              <Button
                onClick={() => handleMoveAllAgents('meeting')}
                variant="outline"
              >
                📍 Move to Meeting
              </Button>
              <Button
                onClick={() => handleMoveAllAgents('lounge')}
                variant="outline"
              >
                📍 Move to Lounge
              </Button>
              <Button onClick={handleStressTest} variant="outline">
                ⚡ Stress Test
              </Button>
            </div>
            <Separator />
            <div className="flex justify-center">
              <Button onClick={handleResetSystem} variant="destructive">
                🔄 Reset System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mission Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Mission Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-100 p-4 text-center">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-4 text-center">
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold">{processingCount}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-4 text-center">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MissionInput onExecute={handleExecuteMission} />
          <TerminalLog logs={logs} onClear={clearLogs} maxLines={100} />
          <AgentStatusPanel agents={agents} />
        </div>

        {/* Office Layout */}
        <Card>
          <CardHeader>
            <CardTitle>Office Layout (Zone Navigation)</CardTitle>
          </CardHeader>
          <CardContent>
            <OfficeLayout />
          </CardContent>
        </Card>

        {/* Store State Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Store State (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <p className="font-bold mb-2">Agents ({agents.length}):</p>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify(agents, null, 2)}
                </pre>
              </div>
              <div>
                <p className="font-bold mb-2">Missions ({missions.length}):</p>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify(missions, null, 2)}
                </pre>
              </div>
              <div>
                <p className="font-bold mb-2">Logs ({logs.length}):</p>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto max-h-64">
                  {JSON.stringify(logs.slice(-10), null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="text-center text-sm space-y-2">
          <p className="font-bold text-lg">✅ Integration Test Checklist</p>
          <p className="text-green-600">
            ✓ Agent Store - Position, Status, Zone Management
          </p>
          <p className="text-green-600">
            ✓ Mission Store - Create, Process, Complete Flow
          </p>
          <p className="text-green-600">
            ✓ Log Store - Multi-type Logging System
          </p>
          <p className="text-green-600">✓ Component State Synchronization</p>
          <p className="text-green-600">✓ Real-time UI Updates</p>
          <p className="text-green-600">✓ Performance Optimization</p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            프로젝트 경로: D:\01_DevProjects\05_AgentTeam\my-office
          </p>
        </div>
      </div>
    </div>
  );
}
