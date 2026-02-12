export type AgentId = 'leo' | 'momo' | 'alex';

export type AgentStatus =
  | 'IDLE'
  | 'MOVING'
  | 'WORKING'
  | 'COMMUNICATING'
  | 'RESTING';

export type Zone = 'work' | 'meeting' | 'lounge';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  zone: Zone;
  x: number;
  y: number;
  status: AgentStatus;
  color: string;
  stressLevel?: number;
}

export const AGENT_COLORS: Record<AgentId, string> = {
  leo: '#ff4444',
  momo: '#ffaa00',
  alex: '#00ccff',
};

export const AGENT_ROLES: Record<AgentId, string> = {
  leo: '코드 마스터',
  momo: '기획 천재',
  alex: '분석가',
};
