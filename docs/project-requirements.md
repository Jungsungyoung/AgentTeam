# My Office - 프로젝트 요구사항 정의서

## 문서 정보
- **작성자**: Momo (기획자)
- **작성일**: 2026-02-12
- **버전**: 1.0
- **상태**: 승인됨

---

## 1. 프로젝트 개요

### 1.1 프로젝트 비전
**My Office**는 AI 에이전트들이 협업하는 과정을 **8비트 픽셀 아트 스타일**로 시각화하는 차세대 AI 협업 시뮬레이터입니다. 단순한 텍스트 로그를 넘어, 사용자가 에이전트들의 움직임과 상호작용을 직관적으로 이해하고 즐길 수 있는 몰입형 경험을 제공합니다.

### 1.2 프로젝트 목표
1. **직관적 시각화**: AI 에이전트의 작업 과정을 픽셀 아트 애니메이션으로 실시간 표현
2. **감정적 연결**: 개성있는 에이전트 캐릭터를 통해 사용자와의 공감대 형성
3. **몰입도 향상**: 레트로 게임 감성으로 사용자 참여도 극대화
4. **확장 가능성**: 다양한 AI 모델 및 협업 시나리오로 확장 가능한 아키텍처

### 1.3 타겟 사용자
- **개발자**: Multi-agent LLM 워크플로우 모니터링이 필요한 개발자
- **PM/기획자**: AI 협업 과정의 시각적 이해가 필요한 의사결정자
- **학생/연구자**: LLM 에이전트 시뮬레이션을 학습하려는 교육 대상
- **크리에이터**: 혁신적인 UI/UX 실험에 관심있는 디자이너

### 1.4 핵심 가치
- ✅ **접근성**: 의존성 최소화, 모든 환경에서 동작
- ✅ **성능**: 60fps 애니메이션, 2초 이하 초기 로딩
- ✅ **확장성**: 에이전트 추가, 기능 확장이 용이한 구조
- ✅ **재미**: 게임같은 경험으로 지루하지 않은 모니터링

---

## 2. 핵심 기능 (MVP)

### 2.1 에이전트 페르소나 시스템
**설명**: 각 에이전트는 고유한 이름, 역할, 색상을 가지며 픽셀 아트로 표현됩니다.

**초기 에이전트 구성**:
- **LEO** (빨강 #ff4444): 코드 마스터 - 개발/구현 전문가
- **MOMO** (주황 #ffaa00): 기획 천재 - 전략/기획 전문가
- **ALEX** (청록 #00ccff): 분석가 - 분석/검증 전문가

**에이전트 상태**:
- `IDLE`: 대기 상태
- `MOVING`: 구역 간 이동 중
- `WORKING`: 작업 처리 중
- `COMMUNICATING`: 다른 에이전트와 협업 중
- `RESTING`: 휴식 중

### 2.2 가상 오피스 환경
**설명**: 에이전트들이 활동하는 3개의 구역으로 구성된 가상 오피스

**구역 구조**:
1. **WORK ZONE (작업 구역)**: 각 에이전트의 개별 책상, 독립 작업 공간
2. **MEETING ROOM (회의실)**: 협업 및 토론 공간, 동시 상호작용
3. **LOUNGE (라운지)**: 휴식 및 대기 공간, 스트레스 관리

**기능**:
- 구역 간 에이전트 이동 애니메이션
- 구역별 목적에 맞는 시각화
- 사용자가 버튼으로 에이전트 이동 제어 가능

### 2.3 실시간 작업 로그 시스템
**설명**: 에이전트의 활동을 터미널 스타일로 실시간 표시

**로그 유형**:
- `[SYSTEM]`: 시스템 초기화 및 상태 메시지
- `[MISSION]`: 사용자가 입력한 미션
- `[COLLAB]`: 에이전트 간 협업 메시지
- `[COMPLETE]`: 작업 완료 메시지
- `AGENT_NAME: ACTION`: 개별 에이전트 활동

**기능**:
- 최대 6개 로그 라인 표시
- 자동 스크롤 (최신 로그 우선)
- 터미널 스타일 폰트 적용

### 2.4 미션 입력 인터페이스
**설명**: 사용자가 에이전트에게 작업을 지시하는 UI

**기능**:
- 텍스트 입력 필드 (최대 100자)
- EXECUTE 버튼 또는 Enter 키로 실행
- 실행 중 버튼 비활성화
- 미션 분석 후 에이전트 자동 배분

### 2.5 에이전트 상태 패널
**설명**: 각 에이전트의 현재 상태를 실시간으로 표시

**표시 정보**:
- 에이전트 이름 (색상 코딩)
- 역할 설명
- 현재 상태 (STATUS)
- 현재 위치 (ZONE)

---

## 3. 기술 스택 제안

### 3.1 프레임워크 및 라이브러리

#### **Next.js 14+ (App Router)**
**선택 이유**:
- ✅ React 18+의 서버 컴포넌트 지원으로 초기 로딩 최적화
- ✅ 파일 기반 라우팅으로 개발 생산성 향상
- ✅ 이미지 최적화, 번들 최적화 기본 제공
- ✅ Vercel 배포 최적화 (자동 CI/CD)
- ✅ 풍부한 커뮤니티와 생태계

**대안**:
- Create React App: 설정 간단하지만 최적화 부족
- Vite: 빠른 개발 서버지만 프로덕션 최적화 제한적

### 3.2 UI 라이브러리

#### **Shadcn/ui**
**선택 이유**:
- ✅ Headless 컴포넌트로 완전한 커스터마이징 가능
- ✅ 복사 붙여넣기 방식으로 번들 크기 최소화
- ✅ Radix UI 기반으로 접근성 기본 보장
- ✅ Tailwind CSS와 완벽한 통합
- ✅ TypeScript 완벽 지원

**대안**:
- Material-UI: 무겁고 커스터마이징 어려움
- Ant Design: 엔터프라이즈 스타일이 픽셀 아트와 부조화

### 3.3 스타일링

#### **Tailwind CSS**
**선택 이유**:
- ✅ Utility-first 방식으로 빠른 개발
- ✅ 사용하지 않는 스타일 자동 제거 (PurgeCSS)
- ✅ 반응형 디자인 간편하게 구현
- ✅ 커스텀 디자인 시스템 구축 용이
- ✅ Shadcn/ui와 완벽한 호환

**애니메이션**:
- CSS `@keyframes`: 기본 애니메이션 (jumping, talking)
- Framer Motion (v2.0+): 고급 애니메이션 및 트랜지션

### 3.4 상태 관리

#### **Zustand**
**선택 이유**:
- ✅ 초경량 (1KB 미만)
- ✅ 간단한 API (Redux 대비 보일러플레이트 90% 감소)
- ✅ React 18 Concurrent Mode 완벽 지원
- ✅ DevTools 지원으로 디버깅 용이
- ✅ TypeScript 타입 추론 우수

**대안**:
- Redux Toolkit: 무겁고 복잡함 (작은 프로젝트에 과함)
- Jotai/Recoil: 원자 기반 상태로 학습 곡선 존재

### 3.5 인증 방식

#### **NextAuth.js (Auth.js v5)**
**선택 이유**:
- ✅ Next.js와 완벽한 통합
- ✅ 다양한 OAuth 제공자 지원 (Google, GitHub 등)
- ✅ JWT 및 세션 기반 인증 모두 지원
- ✅ 보안 기본 설정 제공 (CSRF, XSS 방어)
- ✅ Edge Runtime 지원 (빠른 응답)

**초기 구현**:
- Phase 1: 인증 없음 (프로토타입)
- Phase 2: Google OAuth + GitHub OAuth
- Phase 3: 이메일 로그인 추가

### 3.6 API 통신

#### **TanStack Query (React Query)**
**선택 이유**:
- ✅ 서버 상태 관리 특화
- ✅ 자동 캐싱, 리페칭, 무효화
- ✅ 로딩/에러 상태 관리 간편
- ✅ Optimistic UI 업데이트 지원
- ✅ DevTools로 네트워크 디버깅 용이

**대안**:
- SWR: Vercel에서 만들었지만 기능이 제한적
- Axios: 단순 HTTP 클라이언트로 캐싱 없음

#### **AI API 통신 (Phase 2+)**
- **Claude API**: Anthropic Claude 3.5+ (멀티에이전트 협업)
- **OpenAI API**: GPT-4 Turbo (대안)
- **Local LLM**: Ollama (오프라인 개발/테스트)

### 3.7 타입 안정성

#### **TypeScript 5.3+**
**선택 이유**:
- ✅ 컴파일 타임 에러 사전 방지
- ✅ IDE 자동완성 및 리팩토링 지원
- ✅ 대규모 코드베이스 유지보수 용이
- ✅ 팀 협업 시 명확한 인터페이스 정의

**타입 검증**:
- **Zod**: 런타임 스키마 검증 (API 응답, 사용자 입력)

### 3.8 테스트

#### **Vitest + Testing Library**
**선택 이유**:
- ✅ Vite 기반으로 초고속 테스트 실행
- ✅ Jest 호환 API로 마이그레이션 쉬움
- ✅ ESM 네이티브 지원
- ✅ React Testing Library로 사용자 중심 테스트

#### **Playwright**
**선택 이유**:
- ✅ E2E 테스트 표준
- ✅ 크로스 브라우저 지원
- ✅ 자동 대기 및 재시도
- ✅ 스크린샷 및 비디오 녹화

### 3.9 개발 도구

**필수**:
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **Husky + lint-staged**: Git hooks로 커밋 전 검증

**권장**:
- **Turbo**: 모노레포 빌드 최적화 (확장 시)
- **Storybook**: 컴포넌트 문서화 및 개발

---

## 4. 프로젝트 구조

### 4.1 디렉토리 구조 (제안)

```
my-office/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # 메인 대시보드
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                 # API 라우트
│   │   ├── agents/
│   │   └── missions/
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 홈 페이지
├── components/              # React 컴포넌트
│   ├── agents/              # 에이전트 관련 컴포넌트
│   │   ├── AgentCard.tsx
│   │   ├── AgentPixelArt.tsx
│   │   └── AgentStatusPanel.tsx
│   ├── office/              # 오피스 환경 컴포넌트
│   │   ├── OfficeZone.tsx
│   │   ├── WorkZone.tsx
│   │   ├── MeetingRoom.tsx
│   │   └── Lounge.tsx
│   ├── mission/             # 미션 관련 컴포넌트
│   │   ├── MissionInput.tsx
│   │   └── TerminalLog.tsx
│   └── ui/                  # Shadcn/ui 컴포넌트
│       ├── button.tsx
│       ├── input.tsx
│       └── card.tsx
├── lib/                     # 유틸리티 및 설정
│   ├── api/                 # API 클라이언트
│   ├── hooks/               # 커스텀 React hooks
│   ├── store/               # Zustand 스토어
│   ├── types/               # TypeScript 타입
│   └── utils.ts             # 공용 유틸리티
├── public/                  # 정적 파일
│   ├── fonts/
│   └── images/
├── styles/                  # 전역 스타일
│   └── globals.css
├── tests/                   # 테스트 파일
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local               # 환경 변수
├── next.config.js           # Next.js 설정
├── tailwind.config.js       # Tailwind 설정
├── tsconfig.json            # TypeScript 설정
└── package.json             # 의존성
```

### 4.2 핵심 데이터 모델

```typescript
// lib/types/agent.ts
interface Agent {
  id: 'leo' | 'momo' | 'alex';
  name: string;
  role: string;
  zone: 'work' | 'meeting' | 'lounge';
  x: number;
  y: number;
  status: AgentStatus;
  color: string;
  stressLevel?: number;
}

type AgentStatus =
  | 'IDLE'
  | 'MOVING'
  | 'WORKING'
  | 'COMMUNICATING'
  | 'RESTING';

// lib/types/mission.ts
interface Mission {
  id: string;
  content: string;
  status: 'pending' | 'processing' | 'completed';
  assignedAgents: string[];
  createdAt: Date;
  completedAt?: Date;
}

// lib/types/log.ts
type LogMessage =
  | `> SYSTEM ${string}`
  | `> [MISSION] ${string}`
  | `> [COLLAB] ${string}`
  | `> [COMPLETE] ${string}`
  | `> ${string}: ${string}`;
```

---

## 5. 개발 단계별 계획

### Phase 1: 프로젝트 초기화 (1주)
**목표**: Next.js 프로젝트 세팅 및 기본 구조 구축

**작업 항목**:
- [x] Next.js 14 프로젝트 생성 (App Router)
- [x] TypeScript, ESLint, Prettier 설정
- [x] Tailwind CSS + Shadcn/ui 설치
- [x] 디렉토리 구조 생성
- [x] 환경 변수 설정 (.env.local)
- [x] Git 초기화 및 .gitignore 구성

### Phase 2: 핵심 UI 구현 (1-2주)
**목표**: 에이전트 시각화 및 오피스 환경 구현

**작업 항목**:
- [ ] 픽셀 아트 에이전트 컴포넌트 구현
- [ ] 3개 구역 레이아웃 구현
- [ ] 에이전트 이동 애니메이션
- [ ] 터미널 로그 UI
- [ ] 상태 패널 UI
- [ ] 미션 입력 인터페이스

### Phase 3: 상태 관리 (1주)
**목표**: Zustand로 전역 상태 관리 구축

**작업 항목**:
- [ ] Zustand 설치 및 스토어 설정
- [ ] 에이전트 상태 관리
- [ ] 미션 상태 관리
- [ ] 로그 상태 관리
- [ ] 상태 지속성 (localStorage)

### Phase 4: AI 연동 준비 (2주)
**목표**: Claude API 통합 및 실제 협업 시뮬레이션

**작업 항목**:
- [ ] Claude API 클라이언트 구현
- [ ] 미션 분석 로직
- [ ] 에이전트 Task 자동 생성
- [ ] 실시간 로그 스트리밍
- [ ] 에러 핸들링 및 재시도

### Phase 5: 테스트 및 최적화 (1-2주)
**목표**: 안정성 및 성능 최적화

**작업 항목**:
- [ ] Unit 테스트 작성 (Vitest)
- [ ] E2E 테스트 작성 (Playwright)
- [ ] 성능 측정 및 최적화
- [ ] Lighthouse 점수 90+ 달성
- [ ] 모바일 반응형 개선

### Phase 6: 배포 (1주)
**목표**: Vercel에 프로덕션 배포

**작업 항목**:
- [ ] 환경 변수 설정 (Vercel)
- [ ] CI/CD 파이프라인 구축
- [ ] 도메인 연결
- [ ] 모니터링 설정 (Sentry, Analytics)
- [ ] 문서 작성 (README, API Docs)

---

## 6. 성능 및 품질 목표

### 6.1 성능 지표
- **초기 로딩**: < 2초 (FCP)
- **인터랙티브**: < 3초 (TTI)
- **애니메이션**: 60fps 유지
- **번들 크기**: < 150KB (gzip)
- **Lighthouse 점수**: 90+

### 6.2 품질 지표
- **테스트 커버리지**: 80%+
- **TypeScript 타입 커버리지**: 100%
- **접근성**: WCAG 2.1 AA 준수
- **브라우저 호환성**: 최신 2개 버전

### 6.3 사용자 경험 지표
- **응답 시간**: 사용자 입력 후 100ms 이내 피드백
- **에러율**: < 1%
- **크래시율**: < 0.1%

---

## 7. 위험 요소 및 대응 전략

### 7.1 기술적 위험

| 위험 | 영향도 | 발생 확률 | 완화 전략 |
|------|--------|-----------|-----------|
| API 응답 지연 | 높음 | 중간 | 로딩 상태 표시, 타임아웃 설정 |
| 브라우저 호환성 | 중간 | 낮음 | Polyfill, 크로스 브라우저 테스트 |
| 애니메이션 성능 | 중간 | 중간 | CSS 기반 애니메이션, GPU 가속 |
| 상태 동기화 오류 | 높음 | 낮음 | Zustand 미들웨어, 테스트 강화 |

### 7.2 일정 위험

| 위험 | 영향도 | 발생 확률 | 완화 전략 |
|------|--------|-----------|-----------|
| 기능 추가 요청 | 중간 | 높음 | MVP 범위 명확히 정의, 우선순위 관리 |
| 외부 의존성 문제 | 낮음 | 낮음 | 대안 라이브러리 사전 조사 |
| 테스트 작성 지연 | 중간 | 중간 | TDD 방식 적용, 병렬 테스트 작성 |

---

## 8. 예산 및 리소스

### 8.1 개발 리소스
- **Frontend Engineer**: 1명 (4-6주)
- **QA Engineer**: 0.5명 (2주)
- **Project Manager (Momo)**: 0.5명 (전체 기간)

### 8.2 외부 비용
- **Claude API**: $0 (프로토타입), $50-200/월 (프로덕션)
- **Vercel 호스팅**: $0 (Hobby), $20/월 (Pro)
- **도메인**: $12/년
- **총 예상 비용**: 초기 $0, 운영 $50-200/월

---

## 9. 성공 기준

### 9.1 출시 기준
- ✅ 3명의 에이전트가 정상적으로 시각화됨
- ✅ 미션 입력 및 에이전트 자동 배분 작동
- ✅ 애니메이션이 60fps로 부드럽게 작동
- ✅ Lighthouse 성능 점수 90+
- ✅ 모바일에서 정상 작동
- ✅ 테스트 커버리지 80%+

### 9.2 사용자 만족도
- ✅ 에이전트의 작업 과정이 직관적으로 이해됨
- ✅ 픽셀 아트 스타일이 매력적임
- ✅ 미션 완료 시간이 적절함 (3-5초)
- ✅ 전체적으로 재미있고 몰입됨

---

## 10. 향후 확장 계획

### v1.5.0: 추가 기능
- 에이전트 추가 (최대 8명)
- 커스텀 에이전트 생성
- 미션 히스토리 저장
- 에이전트 성과 대시보드

### v2.0.0: 고급 협업
- 실시간 다중 사용자 지원
- 에이전트 간 갈등 시뮬레이션
- 동적 Task 할당 알고리즘
- 완료도 프로그레스 바

### v3.0.0: 커스터마이제이션
- 테마 시스템 (다크/라이트 모드)
- 구역 레이아웃 커스텀
- 미션 시나리오 작성 도구
- 플러그인 시스템

---

## 11. 결론

이 문서는 **My Office** 프로젝트의 기술적 방향성과 구현 계획을 정의합니다.

**핵심 결정 사항**:
1. **Next.js 14 + TypeScript**: 최신 프레임워크로 최적화와 타입 안정성 확보
2. **Shadcn/ui + Tailwind CSS**: 가볍고 커스터마이징 가능한 UI
3. **Zustand**: 간단하고 강력한 상태 관리
4. **TanStack Query**: 효율적인 서버 상태 관리
5. **NextAuth.js**: 보안이 검증된 인증 시스템

**다음 단계**:
1. ✅ 요구사항 정의 완료 (현재)
2. ⏳ Next.js 프로젝트 초기화 (Task #2)
3. ⏳ 상태 관리 설정 (Task #3)
4. ⏳ 핵심 UI 구현
5. ⏳ AI 연동 및 테스트

---

**문서 승인**:
- **기획자 (Momo)**: ✅ 승인
- **Team Lead**: ⏳ 검토 대기

**최종 업데이트**: 2026-02-12
