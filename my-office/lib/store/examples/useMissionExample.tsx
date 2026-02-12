/**
 * Mission Store 사용 예제
 *
 * 이 파일은 useMissionStore의 다양한 사용 패턴을 보여줍니다.
 */

import { useState } from 'react';
import { useMissionStore } from '../missionStore';
import type { Mission, MissionStatus } from '@/lib/types';

/**
 * 예제 1: 미션 목록 표시
 * 모든 미션을 표시하고 상태별로 필터링
 */
export function MissionListExample() {
  const missions = useMissionStore((state) => state.missions);
  const [filter, setFilter] = useState<MissionStatus | 'all'>('all');

  const filteredMissions =
    filter === 'all' ? missions : missions.filter((m) => m.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Missions</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded px-3 py-1 text-sm ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            All ({missions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`rounded px-3 py-1 text-sm ${
              filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`rounded px-3 py-1 text-sm ${
              filter === 'processing' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`rounded px-3 py-1 text-sm ${
              filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredMissions.map((mission) => (
          <div key={mission.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold">{mission.content}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Created: {mission.createdAt.toLocaleString()}
                </p>
                {mission.completedAt && (
                  <p className="text-sm text-gray-500">
                    Completed: {mission.completedAt.toLocaleString()}
                  </p>
                )}
              </div>
              <span
                className={`rounded px-2 py-1 text-xs ${
                  mission.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : mission.status === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {mission.status}
              </span>
            </div>
            {mission.assignedAgents.length > 0 && (
              <div className="mt-2 flex gap-1">
                {mission.assignedAgents.map((agentId) => (
                  <span
                    key={agentId}
                    className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800"
                  >
                    {agentId}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 예제 2: 미션 생성 폼
 * 새로운 미션을 추가하는 폼
 */
export function CreateMissionExample() {
  const [content, setContent] = useState('');
  const addMission = useMissionStore((state) => state.addMission);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const newMission: Mission = {
      id: crypto.randomUUID(),
      content: content.trim(),
      status: 'pending',
      assignedAgents: [],
      createdAt: new Date(),
    };

    addMission(newMission);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold">Create New Mission</h3>
      <div>
        <label className="block text-sm font-medium">Mission Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the mission..."
          className="mt-1 w-full rounded border p-2"
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={!content.trim()}
        className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
      >
        Create Mission
      </button>
    </form>
  );
}

/**
 * 예제 3: 미션 제어
 * 미션 상태 변경 및 에이전트 할당
 */
export function MissionControlExample({ missionId }: { missionId: string }) {
  const mission = useMissionStore((state) =>
    state.missions.find((m) => m.id === missionId)
  );
  const setMissionStatus = useMissionStore((state) => state.setMissionStatus);
  const assignAgent = useMissionStore((state) => state.assignAgent);
  const unassignAgent = useMissionStore((state) => state.unassignAgent);
  const completeMission = useMissionStore((state) => state.completeMission);

  if (!mission) return <div>Mission not found</div>;

  const handleAssignAgent = (agentId: string) => {
    if (mission.assignedAgents.includes(agentId)) {
      unassignAgent(missionId, agentId);
    } else {
      assignAgent(missionId, agentId);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-bold">{mission.content}</h3>

      {/* 상태 변경 */}
      <div>
        <label className="text-sm font-medium">Status:</label>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setMissionStatus(missionId, 'pending')}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            Pending
          </button>
          <button
            onClick={() => setMissionStatus(missionId, 'processing')}
            className="rounded bg-blue-200 px-3 py-1 text-sm"
          >
            Processing
          </button>
          <button
            onClick={() => completeMission(missionId)}
            className="rounded bg-green-200 px-3 py-1 text-sm"
          >
            Complete
          </button>
        </div>
      </div>

      {/* 에이전트 할당 */}
      <div>
        <label className="text-sm font-medium">Assigned Agents:</label>
        <div className="mt-2 flex gap-2">
          {['leo', 'momo', 'alex'].map((agentId) => (
            <button
              key={agentId}
              onClick={() => handleAssignAgent(agentId)}
              className={`rounded px-3 py-1 text-sm ${
                mission.assignedAgents.includes(agentId)
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {agentId}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 예제 4: 유틸리티 함수 사용
 * getPendingMissions 등의 헬퍼 함수 활용
 */
export function MissionStatusExample() {
  const getPendingMissions = useMissionStore(
    (state) => state.getPendingMissions
  );
  const getProcessingMissions = useMissionStore(
    (state) => state.getProcessingMissions
  );
  const getCompletedMissions = useMissionStore(
    (state) => state.getCompletedMissions
  );

  const pending = getPendingMissions();
  const processing = getProcessingMissions();
  const completed = getCompletedMissions();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg bg-gray-100 p-4">
        <h3 className="font-bold">Pending</h3>
        <p className="text-3xl font-bold">{pending.length}</p>
      </div>
      <div className="rounded-lg bg-blue-100 p-4">
        <h3 className="font-bold">Processing</h3>
        <p className="text-3xl font-bold">{processing.length}</p>
      </div>
      <div className="rounded-lg bg-green-100 p-4">
        <h3 className="font-bold">Completed</h3>
        <p className="text-3xl font-bold">{completed.length}</p>
      </div>
    </div>
  );
}

/**
 * 예제 5: 현재 미션 관리
 * 활성 미션 선택 및 표시
 */
export function CurrentMissionExample() {
  const missions = useMissionStore((state) => state.missions);
  const currentMissionId = useMissionStore((state) => state.currentMissionId);
  const setCurrentMission = useMissionStore((state) => state.setCurrentMission);

  const currentMission = missions.find((m) => m.id === currentMissionId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Current Mission</h2>

      {currentMission ? (
        <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold">{currentMission.content}</h3>
              <p className="mt-1 text-sm text-gray-600">
                Status: {currentMission.status}
              </p>
            </div>
            <button
              onClick={() => setCurrentMission(null)}
              className="text-sm text-red-600 underline"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-gray-500">
          No current mission selected
        </div>
      )}

      <div>
        <h3 className="mb-2 font-semibold">Select a mission:</h3>
        <div className="space-y-2">
          {missions
            .filter((m) => m.status !== 'completed')
            .map((mission) => (
              <button
                key={mission.id}
                onClick={() => setCurrentMission(mission.id)}
                className={`w-full rounded border p-3 text-left ${
                  currentMissionId === mission.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <p className="font-medium">{mission.content}</p>
                <p className="text-sm text-gray-500">{mission.status}</p>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
