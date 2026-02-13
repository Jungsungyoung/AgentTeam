# Real AI Mode 완벽 가이드

## 🎯 개요

Real AI Mode는 Claude Code CLI의 Agent Team 기능과 직접 통합하여, 실제 AI 에이전트들이 협업하며 코드를 작성하는 시스템입니다.

## 🤖 Agent Team 구성

### LEO (Code Master)
- **역할**: 코드 구현 전문가
- **스킬**: TypeScript, React, Next.js, Node.js
- **결과물**: 컴포넌트, API, 유틸리티 함수
- **스킬 문서**: `skills/leo/react-best-practices.md`

### MOMO (Planning Genius)
- **역할**: 프로젝트 기획 및 계획
- **스킬**: Agile, 태스크 분해, 로드맵 작성
- **결과물**: 프로젝트 계획서, 태스크 리스트
- **스킬 문서**: `skills/momo/agile-planning.md`

### ALEX (Analyst)
- **역할**: 코드 분석 및 검증
- **스킬**: 테스팅, 코드 리뷰, 리스크 평가
- **결과물**: 분석 리포트, 테스트 계획
- **스킬 문서**: `skills/alex/testing-strategy.md`

## 🔄 Real Mode 실행 흐름

### Phase 1: Team 초기화
```
[REAL MODE] Initializing agent team...
[REAL MODE] Loading agent personas and skills...
[LEO] Loaded 1 skill documents
[MOMO] Loaded 1 skill documents  
[ALEX] Loaded 1 skill documents
[REAL MODE] Team created with personas and skills
```

### Phase 2: 미션 분석
```
[REAL MODE] Analyzing mission: "로그인페이지 만들어줘"
[MOMO] Breaking down mission into tasks...
[MOMO] Created 3 tasks:
  - Task 1: Design login UI structure
  - Task 2: Implement login form component
  - Task 3: Add validation and API integration
```

### Phase 3: Agent 협업
```
[LEO] Starting Task 2: Implement login form...
[LEO → MOMO] "Should we use email or username for login?"
[MOMO → LEO] "Use email for better UX"
[ALEX] Reviewing LEO's implementation...
[ALEX → LEO] "Add input validation for email format"
```

### Phase 4: 결과물 생성
```
[LEO] Deliverable: LoginForm.tsx
[LEO] Deliverable: useLoginForm.ts (custom hook)
[MOMO] Deliverable: LOGIN_FEATURE_PLAN.md
[ALEX] Deliverable: LOGIN_SECURITY_ANALYSIS.md
```

## 📊 실시간 UI 업데이트

Real Mode에서 볼 수 있는 것들:

### 1. Agent 상태 변화
- **IDLE** → **WORKING** → **COMMUNICATING** → **IDLE**
- 픽셀 아트 애니메이션으로 시각화

### 2. Terminal Logs
```
🚀 Starting mission in real mode
📋 BOSS → LEO: 코드 구현 담당
💬 LEO → MOMO: 기획 확인 필요
✅ MISSION SUCCESS
```

### 3. Chat Panel
- Agent와 직접 대화 가능
- LEO에게: "TypeScript strict mode 사용해줘"
- MOMO에게: "더 자세한 계획 보여줘"
- ALEX에게: "보안 검토 결과는?"

### 4. Deliverables Panel
- 생성된 코드 파일 목록
- Syntax highlighting
- 다운로드 기능
- 타입별 필터 (Code, Document, Analysis, Plan)

### 5. Conversation Timeline
- Agent 간 대화 흐름
- LEO ↔ MOMO ↔ ALEX
- 협업 타입 (Question, Answer, Suggestion, Handoff)

## 🚀 실행 방법

### 1. 서버 시작
```bash
cd my-office
npm run dev
```

### 2. 브라우저 접속
```
http://localhost:3000/office
```

### 3. Mission 입력
```
Mission Input: "로그인페이지 만들어줘"
Mode: Real AI
```

### 4. EXECUTE 클릭

### 5. 결과 확인
- Terminal Log: 진행 상황 실시간 모니터링
- Agent Status Panel: LEO, MOMO, ALEX 상태
- Deliverables: 생성된 파일 확인
- Chat: Agent와 대화

## 🔑 주요 차이점

### Simulation vs Real Mode

| 항목 | Simulation | Real AI |
|------|-----------|---------|
| Agent | 가짜 (하드코딩) | 진짜 (Claude AI) |
| 결과물 | 없음 | 실제 코드/문서 생성 |
| 협업 | 애니메이션만 | 실제 Agent 간 대화 |
| API | 불필요 | Claude Code CLI 사용 |
| 속도 | 즉시 | 수십초~수분 |
| 비용 | 무료 | Claude API 사용량 |

## 📁 생성 파일 예시

### Mission: "로그인페이지 만들어줘"

**LEO 생성:**
```typescript
// LoginForm.tsx
export function LoginForm() {
  const { handleSubmit, errors } = useLoginForm();
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

**MOMO 생성:**
```markdown
# Login Feature Plan

## Phase 1: UI Implementation
- [ ] Create LoginForm component
- [ ] Add form validation
- [ ] Style with Tailwind CSS

## Phase 2: Backend Integration
- [ ] Create /api/auth/login endpoint
- [ ] Add JWT token generation
- [ ] Implement session management
```

**ALEX 생성:**
```markdown
# Login Security Analysis

## Potential Risks
- ⚠️ CSRF attacks
- ⚠️ SQL injection (if using direct queries)
- ⚠️ Weak password policies

## Recommendations
- ✅ Use HTTPS only
- ✅ Implement rate limiting
- ✅ Add 2FA support
```

## 🛠️ 트러블슈팅

### "Unknown error occurred"
→ Claude CLI 설치 확인: `claude --version`

### "Team creation failed"
→ `cliPath: 'claude'` 설정 확인

### Agent가 응답하지 않음
→ Timeout 설정 확인 (기본 5분)

### 결과물이 생성되지 않음
→ Agent에게 명시적으로 요청:
  "코드 파일로 만들어줘"
  "문서로 정리해줘"

## 🎓 Best Practices

1. **명확한 요청**
   - ❌ "페이지 만들어줘"
   - ✅ "React + TypeScript로 로그인 페이지 만들어줘. 이메일/비밀번호 입력 필드와 제출 버튼 포함"

2. **Agent와 대화 활용**
   - Mission 실행 중 Chat Panel 사용
   - LEO에게 코드 스타일 요청
   - MOMO에게 계획 상세화 요청
   - ALEX에게 보안 검토 요청

3. **스킬 문서 커스터마이징**
   - `skills/leo/react-best-practices.md` 수정
   - 프로젝트 고유 컨벤션 추가
   - Agent 품질 향상

4. **결과물 검토**
   - Deliverables Panel에서 코드 확인
   - Syntax highlighting으로 검토
   - 다운로드 후 프로젝트에 통합

## 🎯 활용 예시

### 1. 컴포넌트 생성
```
Mission: "사용자 프로필 카드 컴포넌트 만들어줘. 
아바타, 이름, 이메일, 소개 표시. Tailwind CSS 사용"
```

### 2. API 엔드포인트
```
Mission: "POST /api/users API 엔드포인트 만들어줘.
이메일, 이름, 비밀번호 받아서 사용자 생성"
```

### 3. 프로젝트 계획
```
Mission: "E-commerce 웹사이트 프로젝트 계획 수립해줘.
주요 기능, 기술 스택, 개발 일정 포함"
```

## 📚 추가 자료

- Claude Code CLI: https://github.com/anthropics/claude-code
- Agent Team 문서: `lib/claude-code/README.md`
- Phase 구현 계획: `.claude/plans/zany-discovering-bear.md`

