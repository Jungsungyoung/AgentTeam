import type { AgentId } from './types';

export const AGENT_COLORS = {
  boss: '#bb44ff',
  leo: '#ff4444',
  momo: '#ffaa00',
  alex: '#00ccff',
} as const;

export const getAgentColor = (agentId: AgentId): string => {
  return AGENT_COLORS[agentId];
};

export const getAgentColorClass = (agentId: AgentId): string => {
  const colorMap = {
    boss: 'text-boss',
    leo: 'text-leo',
    momo: 'text-momo',
    alex: 'text-alex',
  };
  return colorMap[agentId];
};

export const getAgentBgColorClass = (agentId: AgentId): string => {
  const colorMap = {
    boss: 'bg-boss',
    leo: 'bg-leo',
    momo: 'bg-momo',
    alex: 'bg-alex',
  };
  return colorMap[agentId];
};
