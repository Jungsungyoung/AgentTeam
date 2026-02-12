/**
 * Agent Store 사용 예제
 *
 * 이 파일은 useAgentStore의 다양한 사용 패턴을 보여줍니다.
 */

import { useEffect } from 'react';
import { useAgentStore } from '../agentStore';
import { AGENT_COLORS, AGENT_ROLES } from '@/lib/types';
import type { AgentId } from '@/lib/types';

/**
 * 예제 1: 기본 사용법
 * 전체 agents 배열을 구독하고 표시
 */
export function AgentListExample() {
  const agents = useAgentStore((state) => state.agents);
  const addAgent = useAgentStore((state) => state.addAgent);

  // 컴포넌트 마운트 시 초기 에이전트 추가
  useEffect(() => {
    const agentIds: AgentId[] = ['leo', 'momo', 'alex'];

    agentIds.forEach((id) => {
      addAgent({
        id,
        name: id.toUpperCase(),
        role: AGENT_ROLES[id],
        zone: 'work',
        x: Math.random() * 800,
        y: Math.random() * 600,
        status: 'IDLE',
        color: AGENT_COLORS[id],
        stressLevel: 0,
      });
    });
  }, [addAgent]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">All Agents</h2>
      <div className="grid gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: agent.color }}
              />
              <span className="font-semibold">{agent.name}</span>
              <span className="text-sm text-gray-500">{agent.role}</span>
            </div>
            <div className="mt-2 text-sm">
              <p>Status: {agent.status}</p>
              <p>
                Position: ({agent.x.toFixed(0)}, {agent.y.toFixed(0)})
              </p>
              <p>Zone: {agent.zone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 예제 2: 선택적 구독
 * 특정 에이전트만 구독하여 불필요한 리렌더링 방지
 */
export function SingleAgentExample({ agentId }: { agentId: AgentId }) {
  const agent = useAgentStore((state) =>
    state.agents.find((a) => a.id === agentId)
  );

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-bold">{agent.name}</h3>
      <p>Status: {agent.status}</p>
    </div>
  );
}

/**
 * 예제 3: Actions 사용
 * 에이전트 상태를 업데이트하는 컨트롤 패널
 */
export function AgentControlExample({ agentId }: { agentId: AgentId }) {
  const agent = useAgentStore((state) =>
    state.agents.find((a) => a.id === agentId)
  );
  const setAgentStatus = useAgentStore((state) => state.setAgentStatus);
  const setAgentZone = useAgentStore((state) => state.setAgentZone);
  const setStressLevel = useAgentStore((state) => state.setStressLevel);

  if (!agent) return null;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-bold">{agent.name} Controls</h3>

      {/* 상태 변경 */}
      <div>
        <label className="text-sm font-medium">Status:</label>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setAgentStatus(agentId, 'IDLE')}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            Idle
          </button>
          <button
            onClick={() => setAgentStatus(agentId, 'WORKING')}
            className="rounded bg-blue-200 px-3 py-1 text-sm"
          >
            Working
          </button>
          <button
            onClick={() => setAgentStatus(agentId, 'RESTING')}
            className="rounded bg-green-200 px-3 py-1 text-sm"
          >
            Resting
          </button>
        </div>
      </div>

      {/* 구역 변경 */}
      <div>
        <label className="text-sm font-medium">Zone:</label>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setAgentZone(agentId, 'work')}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            Work
          </button>
          <button
            onClick={() => setAgentZone(agentId, 'meeting')}
            className="rounded bg-purple-200 px-3 py-1 text-sm"
          >
            Meeting
          </button>
          <button
            onClick={() => setAgentZone(agentId, 'lounge')}
            className="rounded bg-yellow-200 px-3 py-1 text-sm"
          >
            Lounge
          </button>
        </div>
      </div>

      {/* 스트레스 레벨 */}
      <div>
        <label className="text-sm font-medium">
          Stress Level: {agent.stressLevel ?? 0}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={agent.stressLevel ?? 0}
          onChange={(e) => setStressLevel(agentId, Number(e.target.value))}
          className="mt-2 w-full"
        />
      </div>
    </div>
  );
}

/**
 * 예제 4: 선택된 에이전트 관리
 * 에이전트 선택 기능 구현
 */
export function AgentSelectionExample() {
  const agents = useAgentStore((state) => state.agents);
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const selectAgent = useAgentStore((state) => state.selectAgent);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select an Agent</h2>
      <div className="grid grid-cols-3 gap-4">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => selectAgent(agent.id)}
            className={`rounded-lg border p-4 ${
              selectedAgentId === agent.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
          >
            <div
              className="mx-auto mb-2 h-8 w-8 rounded-full"
              style={{ backgroundColor: agent.color }}
            />
            <div className="text-center font-semibold">{agent.name}</div>
          </button>
        ))}
      </div>

      {selectedAgentId && (
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-sm text-gray-600">
            Selected: {agents.find((a) => a.id === selectedAgentId)?.name}
          </p>
          <button
            onClick={() => selectAgent(null)}
            className="mt-2 text-sm text-blue-600 underline"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 예제 5: 유틸리티 함수 사용
 * getAgent를 사용한 직접 조회
 */
export function DirectAccessExample() {
  const getAgent = useAgentStore((state) => state.getAgent);

  const handleCheckAgent = (id: AgentId) => {
    const agent = getAgent(id);
    if (agent) {
      alert(`Agent ${agent.name} is ${agent.status}`);
    } else {
      alert('Agent not found');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Direct Agent Access</h2>
      <div className="flex gap-2">
        <button
          onClick={() => handleCheckAgent('leo')}
          className="rounded bg-red-200 px-4 py-2"
        >
          Check LEO
        </button>
        <button
          onClick={() => handleCheckAgent('momo')}
          className="rounded bg-orange-200 px-4 py-2"
        >
          Check MOMO
        </button>
        <button
          onClick={() => handleCheckAgent('alex')}
          className="rounded bg-cyan-200 px-4 py-2"
        >
          Check ALEX
        </button>
      </div>
    </div>
  );
}
