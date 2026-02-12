/**
 * Claude Code CLI Wrapper Types
 *
 * Type definitions for interacting with Claude Code CLI via child process
 */

// Agent Team Events
export type TeamEventType =
  | 'TEAM_CREATED'
  | 'TEAM_ERROR'
  | 'AGENT_MESSAGE'
  | 'AGENT_STATUS'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'STDOUT'
  | 'STDERR';

export interface TeamEvent {
  type: TeamEventType;
  timestamp: Date;
  data: unknown;
  rawOutput?: string;
}

export interface TeamCreateEvent extends TeamEvent {
  type: 'TEAM_CREATED';
  data: {
    teamName: string;
    agents: string[];
  };
}

export interface AgentMessageEvent extends TeamEvent {
  type: 'AGENT_MESSAGE';
  data: {
    agentId: string;
    message: string;
    recipient?: string;
  };
}

export interface AgentStatusEvent extends TeamEvent {
  type: 'AGENT_STATUS';
  data: {
    agentId: string;
    status: 'idle' | 'busy' | 'error';
  };
}

export interface TaskUpdateEvent extends TeamEvent {
  type: 'TASK_UPDATED';
  data: {
    taskId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'error';
  };
}

// CLI Command Options
export interface CreateTeamOptions {
  teamName: string;
  agents?: string[];
  maxAgents?: number;
}

export interface CreateTaskOptions {
  teamName: string;
  subject: string;
  description: string;
  activeForm?: string;
}

export interface SendMessageOptions {
  teamName: string;
  recipient: string;
  message: string;
  type?: 'message' | 'broadcast';
}

// Wrapper Configuration
export interface ClaudeCodeConfig {
  cliPath?: string; // Path to claude-code CLI binary
  workingDirectory?: string;
  timeout?: number; // Process timeout in ms
  maxBufferSize?: number;
}

// Process Management
export interface TeamProcess {
  teamName: string;
  process: any; // ChildProcess type
  status: 'running' | 'stopped' | 'error';
  createdAt: Date;
  events: TeamEvent[];
}

// CLI Response Types
export interface CLIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  rawOutput?: string;
}
