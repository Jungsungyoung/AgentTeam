/**
 * Log Store 사용 예제
 *
 * 이 파일은 useLogStore의 다양한 사용 패턴을 보여줍니다.
 */

import { useState, useEffect } from 'react';
import { useLogStore } from '../logStore';
import type { LogType } from '@/lib/types';

/**
 * 예제 1: 로그 패널
 * 모든 로그 메시지를 시간순으로 표시
 */
export function LogPanelExample() {
  const logs = useLogStore((state) => state.logs);

  return (
    <div className="space-y-2 rounded-lg border bg-gray-900 p-4 text-white">
      <h2 className="text-xl font-bold">System Logs</h2>
      <div className="max-h-96 space-y-1 overflow-y-auto font-mono text-sm">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-gray-400">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span
              className={`font-semibold ${
                log.type === 'SYSTEM'
                  ? 'text-cyan-400'
                  : log.type === 'MISSION'
                    ? 'text-yellow-400'
                    : log.type === 'COLLAB'
                      ? 'text-purple-400'
                      : log.type === 'COMPLETE'
                        ? 'text-green-400'
                        : 'text-white'
              }`}
            >
              [{log.type}]
            </span>
            {log.agentId && (
              <span className="text-orange-400">{log.agentId}:</span>
            )}
            <span>{log.content}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center text-gray-500">No logs yet</div>
        )}
      </div>
    </div>
  );
}

/**
 * 예제 2: 로그 생성 컨트롤
 * 다양한 타입의 로그를 생성하는 버튼들
 */
export function LogCreatorExample() {
  const addSystemLog = useLogStore((state) => state.addSystemLog);
  const addMissionLog = useLogStore((state) => state.addMissionLog);
  const addCollabLog = useLogStore((state) => state.addCollabLog);
  const addCompleteLog = useLogStore((state) => state.addCompleteLog);
  const addAgentLog = useLogStore((state) => state.addAgentLog);

  const [customMessage, setCustomMessage] = useState('');

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-bold">Create Logs</h3>

      {/* 사전 정의된 로그 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => addSystemLog('System initialized successfully')}
          className="rounded bg-cyan-200 px-3 py-2 text-sm"
        >
          System Log
        </button>
        <button
          onClick={() => addMissionLog('New mission assigned')}
          className="rounded bg-yellow-200 px-3 py-2 text-sm"
        >
          Mission Log
        </button>
        <button
          onClick={() => addCollabLog('Agents started collaboration')}
          className="rounded bg-purple-200 px-3 py-2 text-sm"
        >
          Collab Log
        </button>
        <button
          onClick={() => addCompleteLog('Task completed successfully')}
          className="rounded bg-green-200 px-3 py-2 text-sm"
        >
          Complete Log
        </button>
      </div>

      {/* 에이전트 로그 */}
      <div className="flex gap-2">
        <button
          onClick={() => addAgentLog('leo', 'Started working on feature')}
          className="flex-1 rounded bg-red-200 px-3 py-2 text-sm"
        >
          Leo Log
        </button>
        <button
          onClick={() => addAgentLog('momo', 'Planning next sprint')}
          className="flex-1 rounded bg-orange-200 px-3 py-2 text-sm"
        >
          Momo Log
        </button>
        <button
          onClick={() => addAgentLog('alex', 'Analyzing data')}
          className="flex-1 rounded bg-cyan-200 px-3 py-2 text-sm"
        >
          Alex Log
        </button>
      </div>

      {/* 커스텀 로그 */}
      <div>
        <input
          type="text"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Custom log message..."
          className="w-full rounded border p-2 text-sm"
        />
        <button
          onClick={() => {
            if (customMessage.trim()) {
              addSystemLog(customMessage.trim());
              setCustomMessage('');
            }
          }}
          disabled={!customMessage.trim()}
          className="mt-2 w-full rounded bg-blue-500 px-3 py-2 text-sm text-white disabled:bg-gray-300"
        >
          Add Custom Log
        </button>
      </div>
    </div>
  );
}

/**
 * 예제 3: 로그 필터링
 * 타입별, 에이전트별로 로그 필터링
 */
export function LogFilterExample() {
  const logs = useLogStore((state) => state.logs);
  const getLogsByType = useLogStore((state) => state.getLogsByType);
  const getLogsByAgent = useLogStore((state) => state.getLogsByAgent);

  const [filterType, setFilterType] = useState<LogType | 'ALL'>('ALL');
  const [filterAgent, setFilterAgent] = useState<string | 'ALL'>('ALL');

  const filteredLogs =
    filterType !== 'ALL'
      ? getLogsByType(filterType)
      : filterAgent !== 'ALL'
        ? getLogsByAgent(filterAgent)
        : logs;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* 타입 필터 */}
        <div>
          <label className="text-sm font-medium">Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as LogType | 'ALL');
              setFilterAgent('ALL');
            }}
            className="mt-1 rounded border p-1"
          >
            <option value="ALL">All Types</option>
            <option value="SYSTEM">System</option>
            <option value="MISSION">Mission</option>
            <option value="COLLAB">Collab</option>
            <option value="COMPLETE">Complete</option>
            <option value="AGENT">Agent</option>
          </select>
        </div>

        {/* 에이전트 필터 */}
        <div>
          <label className="text-sm font-medium">Filter by Agent:</label>
          <select
            value={filterAgent}
            onChange={(e) => {
              setFilterAgent(e.target.value);
              setFilterType('ALL');
            }}
            className="mt-1 rounded border p-1"
          >
            <option value="ALL">All Agents</option>
            <option value="leo">Leo</option>
            <option value="momo">Momo</option>
            <option value="alex">Alex</option>
          </select>
        </div>
      </div>

      {/* 필터링된 로그 */}
      <div className="rounded-lg border bg-gray-900 p-4 text-white">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">Filtered Logs</h3>
          <span className="text-sm text-gray-400">
            {filteredLogs.length} logs
          </span>
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto font-mono text-sm">
          {filteredLogs.map((log) => (
            <div key={log.id}>
              [{log.type}] {log.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 예제 4: 로그 관리
 * 로그 삭제 및 정리 기능
 */
export function LogManagementExample() {
  const logs = useLogStore((state) => state.logs);
  const maxLogs = useLogStore((state) => state.maxLogs);
  const clearLogs = useLogStore((state) => state.clearLogs);
  const clearOldLogs = useLogStore((state) => state.clearOldLogs);
  const setMaxLogs = useLogStore((state) => state.setMaxLogs);

  const [newMaxLogs, setNewMaxLogs] = useState(maxLogs);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-bold">Log Management</h3>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-100 p-3">
          <p className="text-sm text-gray-600">Current Logs</p>
          <p className="text-2xl font-bold">{logs.length}</p>
        </div>
        <div className="rounded-lg bg-purple-100 p-3">
          <p className="text-sm text-gray-600">Max Logs</p>
          <p className="text-2xl font-bold">{maxLogs}</p>
        </div>
      </div>

      {/* 로그 정리 */}
      <div className="space-y-2">
        <button
          onClick={() => clearOldLogs(50)}
          className="w-full rounded bg-yellow-200 px-3 py-2 text-sm"
        >
          Keep Last 50 Logs
        </button>
        <button
          onClick={() => clearOldLogs(10)}
          className="w-full rounded bg-orange-200 px-3 py-2 text-sm"
        >
          Keep Last 10 Logs
        </button>
        <button
          onClick={clearLogs}
          className="w-full rounded bg-red-200 px-3 py-2 text-sm"
        >
          Clear All Logs
        </button>
      </div>

      {/* Max Logs 설정 */}
      <div>
        <label className="text-sm font-medium">Max Logs Limit:</label>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            value={newMaxLogs}
            onChange={(e) => setNewMaxLogs(Number(e.target.value))}
            min="10"
            max="1000"
            className="flex-1 rounded border p-2"
          />
          <button
            onClick={() => setMaxLogs(newMaxLogs)}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 예제 5: 실시간 로그 스트림
 * 자동으로 새 로그를 생성하여 실시간 느낌 구현
 */
export function LogStreamExample() {
  const logs = useLogStore((state) => state.logs);
  const addSystemLog = useLogStore((state) => state.addSystemLog);
  const addAgentLog = useLogStore((state) => state.addAgentLog);

  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!isStreaming) return;

    const messages = [
      () => addSystemLog('Processing request...'),
      () => addAgentLog('leo', 'Analyzing code structure'),
      () => addAgentLog('momo', 'Planning implementation'),
      () => addAgentLog('alex', 'Running tests'),
      () => addSystemLog('All agents busy'),
    ];

    const interval = setInterval(() => {
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      randomMessage();
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, addSystemLog, addAgentLog]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Real-time Log Stream</h3>
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`rounded px-4 py-2 text-white ${
            isStreaming ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </button>
      </div>

      <div className="rounded-lg border bg-gray-900 p-4 text-white">
        <div className="max-h-64 space-y-1 overflow-y-auto font-mono text-sm">
          {logs.slice(-20).map((log) => (
            <div key={log.id} className="animate-fade-in">
              <span className="text-gray-400">
                {log.timestamp.toLocaleTimeString()}
              </span>{' '}
              <span className="text-cyan-400">[{log.type}]</span>{' '}
              {log.agentId && (
                <span className="text-orange-400">{log.agentId}:</span>
              )}{' '}
              {log.content}
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {isStreaming ? '🟢 Streaming active' : '⚫ Streaming paused'}
      </p>
    </div>
  );
}
