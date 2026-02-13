export type AgentId = 'boss' | 'leo' | 'momo' | 'alex';

export type AgentStatus =
  | 'IDLE'
  | 'MOVING'
  | 'WORKING'
  | 'COMMUNICATING'
  | 'RESTING'
  | 'MANAGING'; // Boss-specific status

export type Zone = 'work' | 'meeting' | 'lounge' | 'office'; // Added office for boss

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
  isManager?: boolean; // Identifies manager agents
}

export const AGENT_COLORS: Record<AgentId, string> = {
  boss: '#bb44ff', // Purple for manager
  leo: '#ff4466',
  momo: '#ffbb33',
  alex: '#00ddff',
};

export const AGENT_ROLES: Record<AgentId, string> = {
  boss: '총괄 매니저',
  leo: '코드 마스터',
  momo: '기획 천재',
  alex: '분석가',
};
