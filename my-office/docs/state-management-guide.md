# State Management Guide - Zustand

## 개요

My Office 프로젝트는 **Zustand**를 상태 관리 라이브러리로 사용합니다.

### 왜 Zustand인가?

- ✅ **단순함**: 보일러플레이트 최소화
- ✅ **타입 안전성**: TypeScript와 완벽한 통합
- ✅ **성능**: 불필요한 리렌더링 방지
- ✅ **DevTools**: Redux DevTools 지원
- ✅ **작은 번들 크기**: ~1KB (압축)

## 설치된 패키지

```json
{
  "dependencies": {
    "zustand": "^5.x.x"
  }
}
```

## 스토어 구조

프로젝트는 3개의 독립적인 스토어로 구성됩니다:

```
lib/store/
├── agentStore.ts      # 에이전트 상태 관리
├── missionStore.ts    # 미션 상태 관리
├── logStore.ts        # 로그 메시지 관리
└── index.ts           # 통합 export
```

## 1. Agent Store

### 사용법

```tsx
import { useAgentStore } from '@/lib/store';

function AgentCard() {
  // 전체 agents 배열 구독
  const agents = useAgentStore((state) => state.agents);

  // 특정 agent만 구독 (선택적 리렌더링)
  const leo = useAgentStore((state) =>
    state.agents.find((a) => a.id === 'leo')
  );

  // Actions 사용
  const updateAgent = useAgentStore((state) => state.updateAgent);
  const setStatus = useAgentStore((state) => state.setAgentStatus);

  const handleStatusChange = () => {
    setStatus('leo', 'WORKING');
  };

  return (
    <div>
      <h2>{leo?.name}</h2>
      <p>Status: {leo?.status}</p>
      <button onClick={handleStatusChange}>Set Working</button>
    </div>
  );
}
```

### 주요 API

#### State

- `agents: Agent[]` - 모든 에이전트 목록
- `selectedAgentId: AgentId | null` - 현재 선택된 에이전트

#### Actions

**에이전트 관리**

- `addAgent(agent: Agent)` - 에이전트 추가
- `updateAgent(id: AgentId, updates: Partial<Agent>)` - 에이전트 업데이트
- `removeAgent(id: AgentId)` - 에이전트 제거

**상태 업데이트**

- `setAgentStatus(id: AgentId, status: AgentStatus)` - 상태 변경
- `setAgentPosition(id: AgentId, x: number, y: number)` - 위치 이동
- `setAgentZone(id: AgentId, zone: Zone)` - 구역 변경
- `setStressLevel(id: AgentId, level: number)` - 스트레스 레벨 설정

**선택 관리**

- `selectAgent(id: AgentId | null)` - 에이전트 선택/해제

**유틸리티**

- `getAgent(id: AgentId)` - 특정 에이전트 조회
- `resetAgents()` - 초기화

## 2. Mission Store

### 사용법

```tsx
import { useMissionStore } from '@/lib/store';

function MissionList() {
  const missions = useMissionStore((state) => state.missions);
  const addMission = useMissionStore((state) => state.addMission);
  const completeMission = useMissionStore((state) => state.completeMission);

  const handleCreateMission = () => {
    addMission({
      id: crypto.randomUUID(),
      content: 'Implement new feature',
      status: 'pending',
      assignedAgents: [],
      createdAt: new Date(),
    });
  };

  return (
    <div>
      {missions.map((mission) => (
        <div key={mission.id}>
          <h3>{mission.content}</h3>
          <p>Status: {mission.status}</p>
          <button onClick={() => completeMission(mission.id)}>Complete</button>
        </div>
      ))}
      <button onClick={handleCreateMission}>Add Mission</button>
    </div>
  );
}
```

### 주요 API

#### State

- `missions: Mission[]` - 모든 미션 목록
- `currentMissionId: string | null` - 현재 활성 미션

#### Actions

**미션 관리**

- `addMission(mission: Mission)` - 미션 추가
- `updateMission(id: string, updates: Partial<Mission>)` - 미션 업데이트
- `removeMission(id: string)` - 미션 제거

**상태 업데이트**

- `setMissionStatus(id: string, status: MissionStatus)` - 미션 상태 변경
- `assignAgent(missionId: string, agentId: string)` - 에이전트 할당
- `unassignAgent(missionId: string, agentId: string)` - 에이전트 할당 해제
- `completeMission(id: string)` - 미션 완료 처리

**현재 미션 관리**

- `setCurrentMission(id: string | null)` - 활성 미션 설정

**유틸리티**

- `getMission(id: string)` - 특정 미션 조회
- `getPendingMissions()` - 대기 중인 미션 목록
- `getProcessingMissions()` - 진행 중인 미션 목록
- `getCompletedMissions()` - 완료된 미션 목록
- `resetMissions()` - 초기화

## 3. Log Store

### 사용법

```tsx
import { useLogStore } from '@/lib/store';

function LogPanel() {
  const logs = useLogStore((state) => state.logs);
  const addSystemLog = useLogStore((state) => state.addSystemLog);
  const addAgentLog = useLogStore((state) => state.addAgentLog);

  const handleSystemLog = () => {
    addSystemLog('System started successfully');
  };

  const handleAgentLog = () => {
    addAgentLog('leo', 'Started working on feature X');
  };

  return (
    <div>
      <div className="logs">
        {logs.map((log) => (
          <div key={log.id}>
            <span>{log.timestamp.toLocaleTimeString()}</span>
            <span>[{log.type}]</span>
            <span>{log.content}</span>
          </div>
        ))}
      </div>
      <button onClick={handleSystemLog}>Add System Log</button>
      <button onClick={handleAgentLog}>Add Agent Log</button>
    </div>
  );
}
```

### 주요 API

#### State

- `logs: LogMessage[]` - 모든 로그 메시지
- `maxLogs: number` - 최대 저장 로그 개수 (기본: 100)

#### Actions

**로그 추가**

- `addLog(log: Omit<LogMessage, 'id' | 'timestamp'>)` - 일반 로그 추가
- `addSystemLog(content: string)` - 시스템 로그 추가
- `addMissionLog(content: string)` - 미션 로그 추가
- `addCollabLog(content: string)` - 협업 로그 추가
- `addCompleteLog(content: string)` - 완료 로그 추가
- `addAgentLog(agentId: string, content: string)` - 에이전트 로그 추가

**로그 제거**

- `removeLog(id: string)` - 특정 로그 제거
- `clearLogs()` - 모든 로그 삭제
- `clearOldLogs(keepCount: number)` - 오래된 로그 정리

**로그 필터링**

- `getLogsByType(type: LogType)` - 타입별 로그 조회
- `getLogsByAgent(agentId: string)` - 에이전트별 로그 조회

**설정**

- `setMaxLogs(max: number)` - 최대 로그 개수 설정

## 성능 최적화

### 1. 선택적 구독 (Selective Subscription)

전체 상태를 구독하는 대신 필요한 부분만 구독:

```tsx
// ❌ 나쁜 예: 전체 상태 구독
const { agents, selectedAgentId } = useAgentStore();

// ✅ 좋은 예: 필요한 부분만 구독
const agents = useAgentStore((state) => state.agents);
const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
```

### 2. 얕은 비교 (Shallow Comparison)

배열이나 객체를 구독할 때 `shallow` 사용:

```tsx
import { shallow } from 'zustand/shallow';

const { agents, selectAgent } = useAgentStore(
  (state) => ({
    agents: state.agents,
    selectAgent: state.selectAgent,
  }),
  shallow
);
```

### 3. 파생 상태 (Derived State)

컴포넌트 내에서 계산하거나 `useMemo` 사용:

```tsx
const agents = useAgentStore((state) => state.agents);
const workingAgents = useMemo(
  () => agents.filter((a) => a.status === 'WORKING'),
  [agents]
);
```

## DevTools 사용법

### 설치 (이미 포함됨)

모든 스토어는 `devtools` 미들웨어가 적용되어 있습니다.

### 사용 방법

1. 브라우저에 Redux DevTools Extension 설치
2. 개발 서버 실행: `npm run dev`
3. DevTools 열기 (F12 → Redux 탭)
4. 스토어 이름으로 필터링:
   - `agent-store`
   - `mission-store`
   - `log-store`

### DevTools 기능

- ✅ 상태 변화 추적
- ✅ 액션 히스토리
- ✅ 타임 트래블 디버깅
- ✅ 상태 스냅샷 저장/복원

## 테스트

### 스토어 테스트 예제

```tsx
import { renderHook, act } from '@testing-library/react';
import { useAgentStore } from '@/lib/store';

describe('useAgentStore', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useAgentStore.getState().resetAgents();
  });

  it('should add agent', () => {
    const { result } = renderHook(() => useAgentStore());

    act(() => {
      result.current.addAgent({
        id: 'leo',
        name: 'Leo',
        role: '코드 마스터',
        zone: 'work',
        x: 0,
        y: 0,
        status: 'IDLE',
        color: '#ff4444',
      });
    });

    expect(result.current.agents).toHaveLength(1);
    expect(result.current.agents[0].id).toBe('leo');
  });

  it('should update agent status', () => {
    const { result } = renderHook(() => useAgentStore());

    act(() => {
      result.current.addAgent({
        id: 'leo',
        name: 'Leo',
        role: '코드 마스터',
        zone: 'work',
        x: 0,
        y: 0,
        status: 'IDLE',
        color: '#ff4444',
      });
    });

    act(() => {
      result.current.setAgentStatus('leo', 'WORKING');
    });

    expect(result.current.agents[0].status).toBe('WORKING');
  });
});
```

## 모범 사례

### 1. 불변성 유지

Zustand는 불변 업데이트를 권장합니다:

```tsx
// ✅ 좋은 예: 새 객체/배열 반환
set((state) => ({
  agents: state.agents.map((agent) =>
    agent.id === id ? { ...agent, status } : agent
  ),
}));

// ❌ 나쁜 예: 직접 수정
set((state) => {
  state.agents[0].status = 'WORKING'; // 동작하지 않음!
  return state;
});
```

### 2. 스토어 분리

관심사 분리를 위해 스토어를 작은 단위로 분리:

- ✅ 각 도메인별 스토어 생성 (agent, mission, log)
- ✅ 스토어 간 의존성 최소화
- ✅ 공유 로직은 유틸리티 함수로 추출

### 3. Actions에서 로직 처리

복잡한 로직은 스토어 액션에 캡슐화:

```tsx
// ✅ 좋은 예: 액션 내에서 로직 처리
completeMission: (id) =>
  set((state) => ({
    missions: state.missions.map((mission) =>
      mission.id === id
        ? { ...mission, status: 'completed', completedAt: new Date() }
        : mission
    ),
  }));

// ❌ 나쁜 예: 컴포넌트에서 로직 처리
const mission = getMission(id);
updateMission(id, { status: 'completed', completedAt: new Date() });
```

## 트러블슈팅

### 1. 리렌더링이 발생하지 않는 경우

- 선택자 함수가 새 참조를 반환하는지 확인
- `shallow` 비교 사용 고려
- DevTools로 상태 변화 확인

### 2. 타입 오류

- 스토어 타입이 올바르게 정의되었는지 확인
- `lib/types/`의 타입 정의 확인
- TypeScript 서버 재시작

### 3. DevTools가 작동하지 않는 경우

- Redux DevTools Extension 설치 확인
- 개발 모드에서 실행 중인지 확인
- 브라우저 콘솔에서 오류 확인

## 참고 자료

- [Zustand 공식 문서](https://docs.pmnd.rs/zustand)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
- [Testing Guide](https://docs.pmnd.rs/zustand/guides/testing)

---

**작성자**: Rex (상태 관리 전문가)
**작성일**: 2026-02-12
**상태**: ✅ 완료
