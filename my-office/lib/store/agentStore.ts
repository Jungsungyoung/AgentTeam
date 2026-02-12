import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Agent, AgentId, AgentStatus, Zone } from '@/lib/types';

interface AgentState {
  agents: Agent[];
  selectedAgentId: AgentId | null;
}

interface AgentActions {
  // Agent 추가/업데이트
  addAgent: (agent: Agent) => void;
  updateAgent: (id: AgentId, updates: Partial<Agent>) => void;
  removeAgent: (id: AgentId) => void;

  // 상태 업데이트
  setAgentStatus: (id: AgentId, status: AgentStatus) => void;
  setAgentPosition: (id: AgentId, x: number, y: number) => void;
  setAgentZone: (id: AgentId, zone: Zone) => void;
  setStressLevel: (id: AgentId, level: number) => void;

  // 선택 상태
  selectAgent: (id: AgentId | null) => void;

  // 유틸리티
  getAgent: (id: AgentId) => Agent | undefined;
  resetAgents: () => void;
}

type AgentStore = AgentState & AgentActions;

const initialState: AgentState = {
  agents: [],
  selectedAgentId: null,
};

export const useAgentStore = create<AgentStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Agent 추가/업데이트
      addAgent: (agent) =>
        set((state) => ({
          agents: [...state.agents, agent],
        })),

      updateAgent: (id, updates) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, ...updates } : agent
          ),
        })),

      removeAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
          selectedAgentId:
            state.selectedAgentId === id ? null : state.selectedAgentId,
        })),

      // 상태 업데이트
      setAgentStatus: (id, status) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, status } : agent
          ),
        })),

      setAgentPosition: (id, x, y) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, x, y } : agent
          ),
        })),

      setAgentZone: (id, zone) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, zone } : agent
          ),
        })),

      setStressLevel: (id, level) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, stressLevel: level } : agent
          ),
        })),

      // 선택 상태
      selectAgent: (id) =>
        set({
          selectedAgentId: id,
        }),

      // 유틸리티
      getAgent: (id) => get().agents.find((agent) => agent.id === id),

      resetAgents: () => set(initialState),
    }),
    {
      name: 'agent-store',
    }
  )
);
