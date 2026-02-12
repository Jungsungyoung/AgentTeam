export type LogType = 'SYSTEM' | 'MISSION' | 'COLLAB' | 'COMPLETE' | 'AGENT';

export interface LogMessage {
  id: string;
  type: LogType;
  content: string;
  timestamp: Date;
  agentId?: string;
}

export type FormattedLog =
  | `> SYSTEM ${string}`
  | `> [MISSION] ${string}`
  | `> [COLLAB] ${string}`
  | `> [COMPLETE] ${string}`
  | `> ${string}: ${string}`;
