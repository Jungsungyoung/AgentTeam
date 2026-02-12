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

`.env.local.example`을 `.env.local`로 복사하고 필요한 값을 설정하세요:

```bash
cp .env.local.example .env.local
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
│   ├── hooks/                # 커스텀 React hooks
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

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# ESLint 실행
npm run lint

# Prettier 포맷팅
npm run format

# Prettier 체크
npm run format:check
```

## 에이전트 페르소나

- **LEO** (빨강 #ff4444): 코드 마스터 - 개발/구현 전문가
- **MOMO** (주황 #ffaa00): 기획 천재 - 전략/기획 전문가
- **ALEX** (청록 #00ccff): 분석가 - 분석/검증 전문가

## 개발 로드맵

- [x] **Phase 1**: 프로젝트 초기화 및 기본 구조 구축
- [ ] **Phase 2**: 핵심 UI 구현 (에이전트 시각화, 오피스 환경)
- [ ] **Phase 3**: 상태 관리 (Zustand)
- [ ] **Phase 4**: AI 연동 (Claude API)
- [ ] **Phase 5**: 테스트 및 최적화
- [ ] **Phase 6**: 프로덕션 배포

## 기여하기

프로젝트에 기여하고 싶으신 분은 이슈를 생성하거나 Pull Request를 제출해주세요.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 문서

자세한 문서는 `docs/` 디렉토리를 참고하세요:

- [프로젝트 요구사항 정의서](../docs/project-requirements.md)

---

**Made with ❤️ by AI Agent Team**
