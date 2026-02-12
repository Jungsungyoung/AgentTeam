# My Office - AI Agent Collaboration Visualizer

AI 에이전트들이 협업하는 과정을 **8비트 픽셀 아트**로 시각화하는 차세대 협업 시뮬레이터

## 프로젝트 개요

**My Office**는 단순한 텍스트 로그를 넘어, 사용자가 AI 에이전트들의 움직임과 상호작용을 직관적으로 이해하고 즐길 수 있는 몰입형 경험을 제공합니다.

### 핵심 가치

- ✅ **접근성**: 의존성 최소화, 모든 환경에서 동작
- ✅ **성능**: 60fps 애니메이션, 2초 이하 초기 로딩
- ✅ **확장성**: 에이전트 추가, 기능 확장이 용이한 구조
- ✅ **재미**: 게임같은 경험으로 지루하지 않은 모니터링

## 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 4.0+ + Shadcn/ui
- **State Management**: Zustand
- **API**: TanStack Query (React Query)
- **Authentication**: NextAuth.js (Phase 2+)
- **Testing**: Vitest + Playwright

## 시작하기

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 환경 변수 설정

`.env.example`을 `.env.local`로 복사하고 필요한 값을 설정하세요:

```bash
cp .env.example .env.local
```

#### 개발 모드

My Office는 3가지 개발 모드를 지원합니다:

- **Simulation Mode (`sim`)**: API 호출 없이 즉각적인 시뮬레이션 응답 (기본값)
  - 빠른 개발 및 테스트에 최적
  - API 비용 없음
  - 오프라인 작업 가능

- **Hybrid Mode (`hybrid`)**: 캐시된 응답 우선, 새로운 미션만 API 호출
  - 개발 비용 최소화
  - 실제 AI 응답 테스트 가능
  - 반복 테스트에 효율적

- **Real Mode (`real`)**: 모든 미션에 대해 실시간 Claude API 호출
  - 프로덕션 동작 시뮬레이션
  - 실제 AI 에이전트 협업 테스트
  - API 키 필수

#### 환경 변수 설명

```bash
# 모드 설정 (sim | hybrid | real)
MODE=sim

# 캐시 활성화 (Hybrid 모드에서 사용)
CACHE_ENABLED=true

# 비용 모니터링 알림 설정
MAX_COST_ALERT=1000          # 일일 API 호출 제한
MAX_TOKENS_PER_DAY=100000    # 일일 토큰 사용 제한

# Claude API 키 (Hybrid/Real 모드 필수)
# ANTHROPIC_API_KEY=your_api_key_here
```

## 프로젝트 구조

```
my-office/
├── app/                      # Next.js App Router
│   ├── api/                  # API 라우트
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 홈 페이지
├── components/               # React 컴포넌트
│   ├── agents/               # 에이전트 관련 컴포넌트
│   ├── office/               # 오피스 환경 컴포넌트
│   ├── mission/              # 미션 관련 컴포넌트
│   └── ui/                   # Shadcn/ui 컴포넌트
├── lib/                      # 유틸리티 및 설정
│   ├── api/                  # API 클라이언트
│   ├── cache/                # 미션 응답 캐싱 (Hybrid 모드)
│   ├── hooks/                # 커스텀 React hooks
│   ├── monitoring/           # 비용 추적 및 모니터링
│   ├── store/                # Zustand 스토어
│   ├── types/                # TypeScript 타입
│   └── utils.ts              # 공용 유틸리티
├── public/                   # 정적 파일
├── styles/                   # 전역 스타일
└── tests/                    # 테스트 파일
    ├── unit/                 # 단위 테스트
    ├── integration/          # 통합 테스트
    └── e2e/                  # E2E 테스트
```

## 스크립트

### 개발 서버

```bash
# 기본 개발 서버 (Simulation 모드)
npm run dev

# Simulation 모드 (API 호출 없음)
npm run dev:sim

# Hybrid 모드 (캐시 우선 + 필요시 API 호출)
npm run dev:hybrid

# Real 모드 (항상 실시간 API 호출)
npm run dev:real
```

### 빌드 및 프로덕션

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 코드 품질

```bash
# ESLint 실행
npm run lint

# Prettier 포맷팅
npm run format

# Prettier 체크
npm run format:check
```

### 비용 모니터링

모든 API 호출은 자동으로 추적되며 프로젝트 루트의 `cost-tracking.json` 파일에 저장됩니다:

```json
{
  "lastUpdated": "2026-02-13T10:30:00.000Z",
  "sessionStats": {
    "totalCalls": 42,
    "cachedCalls": 28,
    "apiCalls": 14,
    "estimatedTokens": 15000,
    "cacheHitRate": "66.67"
  },
  "dailyStats": {
    "date": "2026-02-13",
    "totalCalls": 42,
    "cachedCalls": 28,
    "apiCalls": 14,
    "estimatedTokens": 15000,
    "modes": {
      "sim": 10,
      "hybrid": 25,
      "real": 7
    }
  }
}
```

## 에이전트 페르소나

- **LEO** (빨강 #ff4444): 코드 마스터 - 개발/구현 전문가
- **MOMO** (주황 #ffaa00): 기획 천재 - 전략/기획 전문가
- **ALEX** (청록 #00ccff): 분석가 - 분석/검증 전문가

## 개발 로드맵

- [x] **Phase 1**: 프로젝트 초기화 및 기본 UI 구축 (완료)
  - 픽셀 아트 시스템, 기본 컴포넌트, Zustand 상태 관리
- [x] **Phase 2 Week 1**: Bridge Service 및 통합 인프라 (완료)
  - SSE 기반 실시간 API, 캐싱 시스템, 비용 모니터링
  - React Hook 통합, 통합 테스트 및 이슈 수정
- [x] **Phase 2 Week 2**: Hybrid 모드 구현 (완료)
  - Claude API 클라이언트, Hybrid 모드 핵심 로직
  - 프론트엔드 Hybrid UI 및 상태 관리
  - 종합 사용 가이드 및 API 문서화
- [ ] **Phase 2 Week 3**: Real 모드 및 고급 기능
  - Claude Code CLI 통합, 에이전트 간 협업
- [ ] **Phase 3**: 성능 최적화 및 고급 UI
- [ ] **Phase 4**: 프로덕션 배포

## 기여하기

프로젝트에 기여하고 싶으신 분은 이슈를 생성하거나 Pull Request를 제출해주세요.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 아키텍처

### Phase 2 Week 1 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /office Page (React)                                  │ │
│  │  ├─ useClaudeTeam Hook ─────────────────┐             │ │
│  │  ├─ Zustand Stores (agent/mission/log)  │             │ │
│  │  └─ UI Components (OfficeLayout, etc)   │             │ │
│  └───────────────────────────┬──────────────┼─────────────┘ │
│                              │              │                │
│                         EventSource      State Updates       │
│                              │              │                │
└──────────────────────────────┼──────────────┼────────────────┘
                               │              │
                          SSE Stream      UI Render
                               │              │
┌──────────────────────────────┼──────────────┼────────────────┐
│                    Next.js Server (API)     │                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /api/claude-team (Bridge Service)                     │ │
│  │  ├─ GET/POST handlers                                  │ │
│  │  ├─ SSE Event Generator                                │ │
│  │  └─ Mode Router (sim/hybrid/real)                      │ │
│  └───────────────────┬───────────────┬──────────────────────┘ │
│                      │               │                        │
│              ┌───────┴────┐   ┌──────┴──────┐                │
│              │  Cache     │   │  Cost       │                │
│              │  (LRU)     │   │  Tracker    │                │
│              └────────────┘   └─────────────┘                │
│                      │               │                        │
│              ┌───────┴───────────────┴──────┐                │
│              │  Claude Code CLI Wrapper     │                │
│              │  (Real Mode - Week 3)        │                │
│              └──────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

1. **미션 제출**: 사용자가 `/office` 페이지에서 미션 입력
2. **SSE 연결**: `useClaudeTeam` hook이 EventSource로 `/api/claude-team` 연결
3. **이벤트 스트리밍**: 서버가 실시간으로 13개 이벤트 전송
   - `team_log`: 팀 로그 메시지
   - `agent_status`: 에이전트 상태 변화
   - `agent_message`: 에이전트 메시지
   - `mission_complete`: 완료 알림
4. **상태 업데이트**: Hook이 Zustand store 업데이트
5. **UI 반영**: React 컴포넌트 자동 리렌더링

## 문서

자세한 문서는 `docs/` 디렉토리를 참고하세요:

### 사용 가이드
- [개발 모드 가이드](docs/development-modes.md) - 3가지 모드 비교 및 설정
- [Hybrid 모드 완전 가이드](docs/HYBRID_MODE_GUIDE.md) - 비용 최적화 및 실전 사용법
- [통합 빠른 시작](docs/INTEGRATION_QUICK_START.md) - 빠른 시작 가이드

### API 및 기술 문서
- [API 문서](docs/API_DOCUMENTATION.md) - Bridge Service API 완전 참조
- [상태 관리 가이드](docs/state-management-guide.md) - Zustand 사용법

### 프로젝트 문서
- [Phase 2 Week 1 설정 요약](../SETUP_PHASE2_WEEK1.md)
- [Week 1 통합 테스트 보고서](../WEEK1_INTEGRATION_TEST_REPORT.md)
- [Week 1 회고](../WEEK1_RETROSPECTIVE.md)
- [Week 2 회고](../WEEK2_RETROSPECTIVE.md)

---

**Made with ❤️ by AI Agent Team**
