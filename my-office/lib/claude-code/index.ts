/**
 * Claude Code CLI Wrapper
 *
 * Entry point for Claude Code integration
 */

export { ClaudeCodeWrapper, claudeCode } from './wrapper';
export type {
  ClaudeCodeConfig,
  TeamProcess,
  TeamEvent,
  TeamEventType,
  CreateTeamOptions,
  CreateTaskOptions,
  SendMessageOptions,
  CLIResponse,
  TeamCreateEvent,
  AgentMessageEvent,
  AgentStatusEvent,
  TaskUpdateEvent,
} from './types';
