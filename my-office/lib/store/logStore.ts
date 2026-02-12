import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { LogMessage, LogType } from '@/lib/types';

interface LogState {
  logs: LogMessage[];
  maxLogs: number;
}

interface LogActions {
  // 로그 추가
  addLog: (log: Omit<LogMessage, 'id' | 'timestamp'>) => void;
  addSystemLog: (content: string) => void;
  addMissionLog: (content: string) => void;
  addCollabLog: (content: string) => void;
  addCompleteLog: (content: string) => void;
  addAgentLog: (agentId: string, content: string) => void;

  // 로그 제거
  removeLog: (id: string) => void;
  clearLogs: () => void;
  clearOldLogs: (keepCount: number) => void;

  // 로그 필터링
  getLogsByType: (type: LogType) => LogMessage[];
  getLogsByAgent: (agentId: string) => LogMessage[];

  // 설정
  setMaxLogs: (max: number) => void;
}

type LogStore = LogState & LogActions;

const initialState: LogState = {
  logs: [],
  maxLogs: 100, // 기본값: 최대 100개 로그 저장
};

// ID 생성 함수
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useLogStore = create<LogStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 로그 추가 (일반)
      addLog: (log) =>
        set((state) => {
          const newLog: LogMessage = {
            ...log,
            id: generateId(),
            timestamp: new Date(),
          };

          const logs = [...state.logs, newLog];

          // maxLogs를 초과하면 오래된 로그 제거
          if (logs.length > state.maxLogs) {
            logs.splice(0, logs.length - state.maxLogs);
          }

          return { logs };
        }),

      // 타입별 로그 추가 헬퍼
      addSystemLog: (content) =>
        get().addLog({
          type: 'SYSTEM',
          content,
        }),

      addMissionLog: (content) =>
        get().addLog({
          type: 'MISSION',
          content,
        }),

      addCollabLog: (content) =>
        get().addLog({
          type: 'COLLAB',
          content,
        }),

      addCompleteLog: (content) =>
        get().addLog({
          type: 'COMPLETE',
          content,
        }),

      addAgentLog: (agentId, content) =>
        get().addLog({
          type: 'AGENT',
          content,
          agentId,
        }),

      // 로그 제거
      removeLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        })),

      clearLogs: () =>
        set({
          logs: [],
        }),

      clearOldLogs: (keepCount) =>
        set((state) => {
          if (state.logs.length <= keepCount) return state;
          return {
            logs: state.logs.slice(-keepCount),
          };
        }),

      // 로그 필터링
      getLogsByType: (type) => get().logs.filter((log) => log.type === type),

      getLogsByAgent: (agentId) =>
        get().logs.filter((log) => log.agentId === agentId),

      // 설정
      setMaxLogs: (max) =>
        set((state) => {
          const logs = [...state.logs];
          if (logs.length > max) {
            logs.splice(0, logs.length - max);
          }
          return { maxLogs: max, logs };
        }),
    }),
    {
      name: 'log-store',
    }
  )
);
