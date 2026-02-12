'use client';

import { useCallback, useRef, useState } from 'react';
import { useAgentStore } from '@/lib/store/agentStore';
import { useLogStore } from '@/lib/store/logStore';
import { useMissionStore } from '@/lib/store/missionStore';
import type {
  SSEEvent,
  AgentStatusEvent,
  TeamLogEvent,
  MissionCompleteEvent,
  ExecutionMode,
} from '@/lib/types/sse';

export type { ExecutionMode };

interface UseClaudeTeamReturn {
  executeMission: (mission: string, mode: ExecutionMode) => Promise<void>;
  isConnected: boolean;
  isProcessing: boolean;
  error: string | null;
  disconnect: () => void;
}

export function useClaudeTeam(): UseClaudeTeamReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // Zustand store actions
  const setAgentStatus = useAgentStore((state) => state.setAgentStatus);
  const setAgentPosition = useAgentStore((state) => state.setAgentPosition);
  const setAgentZone = useAgentStore((state) => state.setAgentZone);
  const addLog = useLogStore((state) => state.addLog);
  const addSystemLog = useLogStore((state) => state.addSystemLog);
  const setMissionStatus = useMissionStore((state) => state.setMissionStatus);
  const setCurrentMission = useMissionStore((state) => state.setCurrentMission);

  // SSE Event Handlers
  const handleAgentStatus = useCallback(
    (data: AgentStatusEvent) => {
      const { agentId, status, zone, x, y } = data;

      // Update agent status
      setAgentStatus(agentId, status);

      // Update position if provided
      if (x !== undefined && y !== undefined) {
        setAgentPosition(agentId, x, y);
      }

      // Update zone if provided
      if (zone) {
        setAgentZone(agentId, zone as any);
      }
    },
    [setAgentStatus, setAgentPosition, setAgentZone]
  );

  const handleTeamLog = useCallback(
    (data: TeamLogEvent) => {
      addLog({
        type: data.type,
        content: data.content,
        agentId: data.agentId,
      });
    },
    [addLog]
  );

  const handleMissionComplete = useCallback(
    (data: MissionCompleteEvent) => {
      const { missionId, success, message } = data;

      // Update mission status
      setMissionStatus(missionId, 'completed');

      // Add completion log
      addLog({
        type: 'COMPLETE',
        content: message,
      });

      // Reset processing state
      setIsProcessing(false);
      setIsConnected(false);
    },
    [setMissionStatus, addLog]
  );

  // Disconnect existing connection
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setIsProcessing(false);
      reconnectAttemptsRef.current = 0;
    }
  }, []);

  // Execute mission with SSE connection
  const executeMission = useCallback(
    async (mission: string, mode: ExecutionMode) => {
      // Disconnect existing connection
      disconnect();

      // Reset error state
      setError(null);
      setIsProcessing(true);

      try {
        // Add system log for mission start
        addSystemLog(`🚀 Starting mission in ${mode} mode: ${mission}`);

        // Generate mission ID
        const missionId = `mission-${Date.now()}`;

        // Create new mission in store
        useMissionStore.getState().addMission({
          id: missionId,
          content: mission,
          status: 'processing',
          assignedAgents: [],
          createdAt: new Date(),
        });

        setCurrentMission(missionId);

        // Create EventSource connection
        const url = `/api/claude-team?mission=${encodeURIComponent(mission)}&mode=${mode}&missionId=${missionId}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // Connection opened
        eventSource.onopen = () => {
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
          addSystemLog('✓ Connected to Claude Team service');
        };

        // Handle SSE messages
        eventSource.onmessage = (event) => {
          try {
            const sseEvent: SSEEvent = JSON.parse(event.data);

            switch (sseEvent.type) {
              case 'agent_status':
                handleAgentStatus(sseEvent.data);
                break;

              case 'agent_message':
                // Handle agent message events
                if (sseEvent.data.agentId && sseEvent.data.message) {
                  addLog({
                    type: 'AGENT',
                    content: sseEvent.data.message,
                    agentId: sseEvent.data.agentId,
                  });
                }
                break;

              case 'team_log':
                handleTeamLog(sseEvent.data);
                break;

              case 'mission_complete':
                handleMissionComplete(sseEvent.data);
                disconnect(); // Close connection on completion
                break;

              case 'error':
                setError(sseEvent.data.message || 'Unknown error occurred');
                addLog({
                  type: 'SYSTEM',
                  content: `❌ Error: ${sseEvent.data.message}`,
                });
                disconnect();
                break;

              default:
                console.warn('Unknown SSE event type:', sseEvent.type);
            }
          } catch (parseError) {
            console.error('Failed to parse SSE event:', parseError);
            addSystemLog('⚠ Failed to parse server event');
          }
        };

        // Handle errors
        eventSource.onerror = (err) => {
          console.error('SSE connection error:', err);

          // Attempt reconnection
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            addSystemLog(
              `⚠ Connection lost. Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
            );

            // Retry after 2 seconds
            setTimeout(() => {
              if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
                executeMission(mission, mode);
              }
            }, 2000);
          } else {
            setError('Connection failed after multiple attempts');
            addSystemLog('❌ Connection failed. Please try again.');
            disconnect();
          }
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        addSystemLog(`❌ Failed to start mission: ${errorMessage}`);
        setIsProcessing(false);
      }
    },
    [
      disconnect,
      addSystemLog,
      setCurrentMission,
      handleAgentStatus,
      handleTeamLog,
      handleMissionComplete,
      addLog,
    ]
  );

  return {
    executeMission,
    isConnected,
    isProcessing,
    error,
    disconnect,
  };
}
