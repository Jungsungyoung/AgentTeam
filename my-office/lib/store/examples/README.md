# Store Usage Examples

이 디렉토리에는 My Office 프로젝트에서 사용하는 Zustand 스토어들의 실전 예제가 포함되어 있습니다.

## 파일 구조

```
examples/
├── useAgentExample.tsx    # Agent Store 사용 예제
├── useMissionExample.tsx  # Mission Store 사용 예제
├── useLogExample.tsx      # Log Store 사용 예제
└── README.md              # 이 파일
```

## 예제 컴포넌트 목록

### Agent Store (`useAgentExample.tsx`)

1. **AgentListExample** - 전체 에이전트 목록 표시
2. **SingleAgentExample** - 단일 에이전트 선택적 구독
3. **AgentControlExample** - 에이전트 상태 제어 패널
4. **AgentSelectionExample** - 에이전트 선택 기능
5. **DirectAccessExample** - 유틸리티 함수 직접 사용

### Mission Store (`useMissionExample.tsx`)

1. **MissionListExample** - 미션 목록 및 필터링
2. **CreateMissionExample** - 새 미션 생성 폼
3. **MissionControlExample** - 미션 상태 및 에이전트 할당
4. **MissionStatusExample** - 상태별 미션 통계
5. **CurrentMissionExample** - 현재 활성 미션 관리

### Log Store (`useLogExample.tsx`)

1. **LogPanelExample** - 로그 패널 (콘솔 스타일)
2. **LogCreatorExample** - 다양한 타입의 로그 생성
3. **LogFilterExample** - 타입/에이전트별 필터링
4. **LogManagementExample** - 로그 삭제 및 관리
5. **LogStreamExample** - 실시간 로그 스트리밍 시뮬레이션

## 사용 방법

### 1. 개별 예제 컴포넌트 import

```tsx
import {
  AgentListExample,
  AgentControlExample,
} from '@/lib/store/examples/useAgentExample';

export default function Page() {
  return (
    <div className="p-8">
      <AgentListExample />
      <AgentControlExample agentId="leo" />
    </div>
  );
}
```

### 2. 예제 페이지 생성

프로젝트에 예제 페이지를 만들어 모든 예제를 한 곳에서 확인:

```tsx
// app/examples/page.tsx
import { AgentListExample } from '@/lib/store/examples/useAgentExample';
import { MissionListExample } from '@/lib/store/examples/useMissionExample';
import { LogPanelExample } from '@/lib/store/examples/useLogExample';

export default function ExamplesPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Store Examples</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-bold">Agent Store</h2>
          <AgentListExample />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Mission Store</h2>
          <MissionListExample />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Log Store</h2>
          <LogPanelExample />
        </section>
      </div>
    </div>
  );
}
```

### 3. Storybook 통합 (선택사항)

Storybook을 사용하는 경우 각 예제를 스토리로 등록:

```tsx
// stories/AgentStore.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AgentListExample } from '@/lib/store/examples/useAgentExample';

const meta: Meta<typeof AgentListExample> = {
  title: 'Store/Agent/AgentList',
  component: AgentListExample,
};

export default meta;
type Story = StoryObj<typeof AgentListExample>;

export const Default: Story = {};
```

## 학습 경로

### 초급

1. **AgentListExample** - 기본 구독 패턴 학습
2. **LogCreatorExample** - 액션 사용법 학습
3. **MissionListExample** - 배열 상태 관리 학습

### 중급

1. **SingleAgentExample** - 선택적 구독으로 성능 최적화
2. **MissionControlExample** - 복잡한 상태 업데이트
3. **LogFilterExample** - 유틸리티 함수 활용

### 고급

1. **AgentSelectionExample** - 여러 상태 조합
2. **CurrentMissionExample** - 전역 상태와 로컬 상태 통합
3. **LogStreamExample** - 실시간 업데이트 처리

## 커스터마이징

각 예제는 독립적으로 작동하므로 프로젝트 요구사항에 맞게 자유롭게 수정 가능합니다:

```tsx
// 예: AgentListExample을 커스터마이징
export function CustomAgentList() {
  const agents = useAgentStore((state) => state.agents);

  // 추가 로직
  const sortedAgents = useMemo(
    () => [...agents].sort((a, b) => a.name.localeCompare(b.name)),
    [agents]
  );

  return (
    <div>
      {/* 커스텀 렌더링 */}
      {sortedAgents.map((agent) => (
        <CustomAgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
```

## 디버깅 팁

### Redux DevTools 활성화

모든 예제 컴포넌트는 Redux DevTools와 호환됩니다:

1. Redux DevTools Extension 설치
2. 개발 서버 실행: `npm run dev`
3. DevTools 열기 (F12 → Redux 탭)
4. 스토어 액션 및 상태 변화 추적

### 콘솔 로깅

스토어 상태를 확인하려면:

```tsx
import { useAgentStore } from '@/lib/store';

// 컴포넌트 내에서
useEffect(() => {
  console.log('Current agents:', useAgentStore.getState().agents);
}, []);
```

## 성능 고려사항

### 선택적 구독 사용

```tsx
// ❌ 전체 상태 구독 (불필요한 리렌더링)
const { agents, selectedAgentId } = useAgentStore();

// ✅ 필요한 부분만 구독
const agents = useAgentStore((state) => state.agents);
```

### 메모이제이션 활용

```tsx
const workingAgents = useMemo(
  () => agents.filter((a) => a.status === 'WORKING'),
  [agents]
);
```

## 참고 자료

- [State Management Guide](../../../docs/state-management-guide.md)
- [Zustand 공식 문서](https://docs.pmnd.rs/zustand)
- [TypeScript 타입 정의](../../types/index.ts)

---

**작성자**: Rex (상태 관리 전문가)
**작성일**: 2026-02-12
