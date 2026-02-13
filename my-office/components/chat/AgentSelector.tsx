'use client';

import { AGENT_COLORS, AGENT_ROLES } from '@/lib/types/agent';
import type { AgentId } from '@/lib/types/agent';

export interface AgentSelectorProps {
  selectedAgent: AgentId;
  onSelectAgent: (agentId: AgentId) => void;
  disabled?: boolean;
}

/**
 * AgentSelector Component
 *
 * Dropdown to select which agent to chat with
 * Displays agent name, role, and color indicator
 */
export function AgentSelector({
  selectedAgent,
  onSelectAgent,
  disabled = false,
}: AgentSelectorProps) {
  const agents: AgentId[] = ['leo', 'momo', 'alex'];

  return (
    <div className="flex items-center gap-2 mb-4 p-3 bg-white/50 rounded-lg border border-gray-200">
      <label className="text-sm font-semibold text-gray-700 font-mono">
        Chat with:
      </label>

      <select
        value={selectedAgent}
        onChange={(e) => onSelectAgent(e.target.value as AgentId)}
        disabled={disabled}
        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {agents.map((agentId) => (
          <option key={agentId} value={agentId}>
            {agentId.toUpperCase()} - {AGENT_ROLES[agentId]}
          </option>
        ))}
      </select>

      {/* Color indicator */}
      <div
        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: AGENT_COLORS[selectedAgent] }}
        title={`${selectedAgent.toUpperCase()}'s color`}
      />
    </div>
  );
}
