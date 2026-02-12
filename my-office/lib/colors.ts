import type { AgentId } from './types';

export const AGENT_COLORS = {
  leo: '#ff4444',
  momo: '#ffaa00',
  alex: '#00ccff',
} as const;

export const getAgentColor = (agentId: AgentId): string => {
  return AGENT_COLORS[agentId];
};

export const getAgentColorClass = (agentId: AgentId): string => {
  const colorMap = {
    leo: 'text-leo',
    momo: 'text-momo',
    alex: 'text-alex',
  };
  return colorMap[agentId];
};

export const getAgentBgColorClass = (agentId: AgentId): string => {
  const colorMap = {
    leo: 'bg-leo',
    momo: 'bg-momo',
    alex: 'bg-alex',
  };
  return colorMap[agentId];
};
