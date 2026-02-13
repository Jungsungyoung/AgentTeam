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
  | 'error'
  | 'agent_collaboration' // Agent-to-agent conversation
  | 'task_progress' // Task execution progress
  | 'mission_deliverable' // Mission output/artifact
  | 'user_prompt_required' // Agent needs user input
  | 'chat_message'; // Bidirectional user-agent chat

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

/**
 * Agent Collaboration Event
 * Represents communication between agents (not user-facing messages)
 */
export interface AgentCollaborationEvent {
  fromAgentId: AgentId;
  toAgentId: AgentId;
  message: string;
  collaborationType: 'question' | 'answer' | 'proposal' | 'approval' | 'handoff';
  timestamp: string;
}

/**
 * Task Progress Event
 * Represents progress on a specific task
 */
export interface TaskProgressEvent {
  taskId: string;
  taskName: string;
  agentId: AgentId;
  progress: number; // 0-100
  status: 'started' | 'in_progress' | 'completed' | 'blocked';
  message?: string;
}

/**
 * Mission Deliverable Event
 * Represents a concrete output/artifact from an agent
 */
export interface MissionDeliverableEvent {
  deliverableId: string;
  missionId: string;
  agentId: AgentId;
  type: 'code' | 'document' | 'analysis' | 'plan';
  title: string;
  content: string;
  metadata?: {
    language?: string;
    format?: string;
    tags?: string[];
  };
}

/**
 * User Prompt Required Event
 * Agent needs input from user to proceed
 */
export interface UserPromptRequiredEvent {
  agentId: AgentId;
  question: string;
  context?: string;
  options?: string[]; // Suggested answers (optional)
  requiresResponse: boolean;
}

/**
 * Chat Message Event
 * Bidirectional user-agent chat message
 */
export interface ChatMessageEvent {
  messageId: string;
  missionId: string;
  from: 'user' | AgentId;
  to: 'user' | AgentId;
  message: string;
  timestamp: string;
}
