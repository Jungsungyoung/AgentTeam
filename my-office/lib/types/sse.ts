import type { AgentId, AgentStatus, Zone } from './agent';
import type { LogType } from './log';

/**
 * SSE Event Types from Bridge Service
 */
export type SSEEventType =
  | 'agent_status'
  | 'agent_message'
  | 'team_log'
  | 'mission_complete'
  | 'error';

/**
 * Base SSE Event Structure
 */
export interface SSEEvent<T = any> {
  type: SSEEventType;
  data: T;
  timestamp: string;
}

/**
 * Agent Status Update Event
 * Sent when an agent changes status, position, or zone
 */
export interface AgentStatusEvent {
  agentId: AgentId;
  status: AgentStatus;
  zone?: Zone;
  x?: number;
  y?: number;
  stressLevel?: number;
}

/**
 * Agent Message Event (Phase 3)
 * Will be used for agent-to-agent communication visualization
 */
export interface AgentMessageEvent {
  agentId: AgentId;
  targetAgentId?: AgentId;
  message: string;
  messageType: 'internal' | 'collaboration' | 'report';
}

/**
 * Team Log Event
 * Terminal-style log entries
 */
export interface TeamLogEvent {
  type: LogType;
  content: string;
  agentId?: AgentId;
}

/**
 * Mission Complete Event
 * Sent when mission execution is finished
 */
export interface MissionCompleteEvent {
  missionId: string;
  success: boolean;
  message: string;
  results?: {
    tasksCompleted: number;
    collaborations: number;
    duration: number;
  };
}

/**
 * Error Event
 * Sent when an error occurs during mission execution
 */
export interface ErrorEvent {
  code: string;
  message: string;
  details?: any;
}

/**
 * Execution Mode Options
 */
export type ExecutionMode = 'simulation' | 'hybrid' | 'real';

export const EXECUTION_MODE_LABELS: Record<ExecutionMode, string> = {
  simulation: 'Simulation (Fast)',
  hybrid: 'Hybrid (Balanced)',
  real: 'Real AI (Full Power)',
};

export const EXECUTION_MODE_DESCRIPTIONS: Record<ExecutionMode, string> = {
  simulation: 'Simulated agent behavior for testing and demo purposes',
  hybrid: 'Mix of simulated movement with real Claude API for decision making',
  real: 'Full Claude API integration for authentic AI agent collaboration',
};
