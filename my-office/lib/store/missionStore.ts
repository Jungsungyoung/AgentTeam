import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Mission, MissionStatus } from '@/lib/types';

interface MissionState {
  missions: Mission[];
  currentMissionId: string | null;
}

interface MissionActions {
  // Mission 추가/업데이트
  addMission: (mission: Mission) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  removeMission: (id: string) => void;

  // 상태 업데이트
  setMissionStatus: (id: string, status: MissionStatus) => void;
  assignAgent: (missionId: string, agentId: string) => void;
  unassignAgent: (missionId: string, agentId: string) => void;
  completeMission: (id: string) => void;

  // 현재 미션 선택
  setCurrentMission: (id: string | null) => void;

  // 유틸리티
  getMission: (id: string) => Mission | undefined;
  getPendingMissions: () => Mission[];
  getProcessingMissions: () => Mission[];
  getCompletedMissions: () => Mission[];
  resetMissions: () => void;
}

type MissionStore = MissionState & MissionActions;

const initialState: MissionState = {
  missions: [],
  currentMissionId: null,
};

export const useMissionStore = create<MissionStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Mission 추가/업데이트
      addMission: (mission) =>
        set((state) => ({
          missions: [...state.missions, mission],
        })),

      updateMission: (id, updates) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === id ? { ...mission, ...updates } : mission
          ),
        })),

      removeMission: (id) =>
        set((state) => ({
          missions: state.missions.filter((mission) => mission.id !== id),
          currentMissionId:
            state.currentMissionId === id ? null : state.currentMissionId,
        })),

      // 상태 업데이트
      setMissionStatus: (id, status) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === id ? { ...mission, status } : mission
          ),
        })),

      assignAgent: (missionId, agentId) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  assignedAgents: [...mission.assignedAgents, agentId],
                }
              : mission
          ),
        })),

      unassignAgent: (missionId, agentId) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  assignedAgents: mission.assignedAgents.filter(
                    (id) => id !== agentId
                  ),
                }
              : mission
          ),
        })),

      completeMission: (id) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === id
              ? { ...mission, status: 'completed', completedAt: new Date() }
              : mission
          ),
        })),

      // 현재 미션 선택
      setCurrentMission: (id) =>
        set({
          currentMissionId: id,
        }),

      // 유틸리티
      getMission: (id) => get().missions.find((mission) => mission.id === id),

      getPendingMissions: () =>
        get().missions.filter((mission) => mission.status === 'pending'),

      getProcessingMissions: () =>
        get().missions.filter((mission) => mission.status === 'processing'),

      getCompletedMissions: () =>
        get().missions.filter((mission) => mission.status === 'completed'),

      resetMissions: () => set(initialState),
    }),
    {
      name: 'mission-store',
    }
  )
);
