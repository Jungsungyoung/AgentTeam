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
  ChatMessageEvent,
  AgentCollaborationEvent,
  MissionDeliverableEvent,
  TaskProgressEvent,
  UserPromptRequiredEvent,
} from '@/lib/types/sse';
import type { AgentId } from '@/lib/types/agent';

export type { ExecutionMode };

interface UseClaudeTeamReturn {
  executeMission: (mission: string, mode: ExecutionMode) => Promise<void>;
  isConnected: boolean;
  isProcessing: boolean;
  error: string | null;
  cacheStatus: 'hit' | 'miss' | null;
  disconnect: () => void;
  // Chat functionality
  sendChatMessage: (agentId: AgentId, message: string) => Promise<void>;
  chatMessages: ChatMessageEvent[];
  selectedChatAgent: AgentId;
  setSelectedChatAgent: (agentId: AgentId) => void;
  isSendingChat: boolean;
  // Collaboration timeline
  collaborationEvents: AgentCollaborationEvent[];
  deliverables: MissionDeliverableEvent[];
  taskProgress: TaskProgressEvent[];
}

export function useClaudeTeam(): UseClaudeTeamReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'hit' | 'miss' | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessageEvent[]>([]);
  const [selectedChatAgent, setSelectedChatAgent] = useState<AgentId>('leo');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEventSourceRef = useRef<EventSource | null>(null);

  // Collaboration timeline state
  const [collaborationEvents, setCollaborationEvents] = useState<AgentCollaborationEvent[]>([]);
  const [deliverables, setDeliverables] = useState<MissionDeliverableEvent[]>([]);
  const [taskProgress, setTaskProgress] = useState<TaskProgressEvent[]>([]);

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

      // Detect cache hit/miss from log content
      if (data.content.includes('[HYBRID MODE]')) {
        if (data.content.includes('Cache hit')) {
          setCacheStatus('hit');
        } else if (data.content.includes('Cache miss')) {
          setCacheStatus('miss');
        }
      }
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
      setCacheStatus(null);
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
      setCacheStatus(null);
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
                setError(sseEvent.data.error || sseEvent.data.message || 'Unknown error occurred');
                addLog({
                  type: 'SYSTEM',
                  content: `❌ Error: ${sseEvent.data.error || sseEvent.data.message || 'Unknown error occurred'}`,
                });
                disconnect();
                break;

              case 'agent_collaboration':
                // Track agent-to-agent collaboration
                setCollaborationEvents((prev) => [...prev, sseEvent.data]);
                addLog({
                  type: 'COLLAB',
                  content: `${sseEvent.data.fromAgentId.toUpperCase()} → ${sseEvent.data.toAgentId.toUpperCase()}: ${sseEvent.data.message}`,
                });
                break;

              case 'mission_deliverable':
                // Track deliverables
                setDeliverables((prev) => [...prev, sseEvent.data]);
                addLog({
                  type: 'SYSTEM',
                  content: `📦 ${sseEvent.data.agentId.toUpperCase()} created ${sseEvent.data.type}: ${sseEvent.data.title}`,
                });
                break;

              case 'task_progress':
                // Track task progress
                setTaskProgress((prev) => {
                  const existing = prev.find((p) => p.taskId === sseEvent.data.taskId);
                  if (existing) {
                    return prev.map((p) =>
                      p.taskId === sseEvent.data.taskId ? sseEvent.data : p
                    );
                  }
                  return [...prev, sseEvent.data];
                });
                break;

              case 'user_prompt_required':
                // Handle user prompt requests
                addLog({
                  type: 'SYSTEM',
                  content: `❓ ${sseEvent.data.agentId.toUpperCase()} needs input: ${sseEvent.data.question}`,
                });
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

  // Send chat message to agent
  const sendChatMessage = useCallback(
    async (agentId: AgentId, message: string) => {
      const currentMissionId = useMissionStore.getState().currentMissionId;

      if (!currentMissionId) {
        setError('No active mission. Start a mission first.');
        return;
      }

      if (!message || message.trim().length === 0) {
        return;
      }

      setIsSendingChat(true);

      try {
        // Close existing chat connection if any
        if (chatEventSourceRef.current) {
          chatEventSourceRef.current.close();
          chatEventSourceRef.current = null;
        }

        // Create EventSource for chat stream
        const url = `/api/chat`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            missionId: currentMissionId,
            agentId,
            message: message.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setIsSendingChat(false);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');

          // Keep incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));

                if (eventData.type === 'chat_message') {
                  const chatMessage: ChatMessageEvent = eventData.data;
                  setChatMessages((prev) => [...prev, chatMessage]);
                } else if (eventData.type === 'error') {
                  setError(eventData.data.error);
                  setIsSendingChat(false);
                  break;
                } else if (eventData.type === 'complete') {
                  setIsSendingChat(false);
                }
              } catch (parseError) {
                console.error('Failed to parse chat event:', parseError);
              }
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        addSystemLog(`❌ Chat error: ${errorMessage}`);
        setIsSendingChat(false);
      }
    },
    [addSystemLog]
  );

  return {
    executeMission,
    isConnected,
    isProcessing,
    error,
    cacheStatus,
    disconnect,
    // Chat functionality
    sendChatMessage,
    chatMessages,
    selectedChatAgent,
    setSelectedChatAgent,
    isSendingChat,
    // Collaboration timeline
    collaborationEvents,
    deliverables,
    taskProgress,
  };
}
