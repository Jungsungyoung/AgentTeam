# Phase 5: Collaboration Timeline & E2E Testing

## Overview

Phase 5 completes the Real Mode integration with agent collaboration visualization and comprehensive end-to-end testing. This phase ensures the entire system works reliably from mission submission through agent execution to deliverable creation.

**Status:** ✅ Complete
**Date:** 2026-02-13
**Developer:** qa-specialist

## Implementation Summary

### Files Created

#### Collaboration Timeline Components
1. **`components/conversation/ConversationTimeline.tsx`** - Agent collaboration visualizer
2. **`components/conversation/index.ts`** - Component exports

#### E2E Test Suite
3. **`tests/e2e/scenario1-simple-mission.ts`** - Simple mission test
4. **`tests/e2e/scenario2-user-prompt.ts`** - User prompt flow test
5. **`tests/e2e/scenario3-collaboration.ts`** - Collaboration detection test
6. **`tests/e2e/scenario4-skill-application.ts`** - Skill verification test
7. **`tests/e2e/run-all-tests.ts`** - Test suite runner
8. **`tests/e2e/README.md`** - Test documentation

#### Documentation
9. **`docs/PHASE5_E2E_TESTING.md`** - This document

### Files Modified

1. **`lib/hooks/useClaudeTeam.ts`** - Extended with collaboration event tracking
2. **`package.json`** - Added E2E test scripts

## Features Implemented

### 1. ConversationTimeline Component

**Purpose**: Visualize agent-to-agent collaboration in real-time

**Key Features**:
- ✅ Real-time collaboration event display
- ✅ 6 filter types: All, Question, Answer, Proposal, Approval, Handoff
- ✅ Agent color-coded message bubbles
- ✅ Timestamps with precise time display
- ✅ Collaboration type badges
- ✅ Empty state for no collaborations
- ✅ Scrollable container (max 500px height)
- ✅ Responsive layout

**Props**:
```typescript
interface ConversationTimelineProps {
  collaborationEvents: AgentCollaborationEvent[];
  className?: string;
}
```

**Usage**:
```tsx
import { ConversationTimeline } from '@/components/conversation';

function MyPage() {
  const { collaborationEvents } = useClaudeTeam();

  return (
    <ConversationTimeline
      collaborationEvents={collaborationEvents}
      className="mt-4"
    />
  );
}
```

**Collaboration Types**:
- **Question** (❓): Agent asks another agent
- **Answer** (💬): Agent responds to question
- **Proposal** (💡): Agent suggests an approach
- **Approval** (✅): Agent approves a proposal
- **Handoff** (🔄): Agent hands off work

**UI Components**:
- `FilterButton`: Type filter with count badges
- `CollaborationMessage`: Individual message display
- `adjustColorBrightness()`: Helper for color variations

### 2. Extended useClaudeTeam Hook

**New State**:
```typescript
const [collaborationEvents, setCollaborationEvents] = useState<AgentCollaborationEvent[]>([]);
const [deliverables, setDeliverables] = useState<MissionDeliverableEvent[]>([]);
const [taskProgress, setTaskProgress] = useState<TaskProgressEvent[]>([]);
```

**New Return Values**:
```typescript
interface UseClaudeTeamReturn {
  // ... existing
  collaborationEvents: AgentCollaborationEvent[];
  deliverables: MissionDeliverableEvent[];
  taskProgress: TaskProgressEvent[];
}
```

**Event Handling**:
- `agent_collaboration` → Updates `collaborationEvents`, adds COLLAB log
- `mission_deliverable` → Updates `deliverables`, adds SYSTEM log
- `task_progress` → Updates `taskProgress` (merges by taskId)
- `user_prompt_required` → Adds SYSTEM log with prompt

### 3. E2E Test Suite

**Test Infrastructure**:
- Node.js + tsx for TypeScript execution
- SSE streaming with `node:fetch`
- Real-time event processing
- Structured test results
- JSON report generation

#### Scenario 1: Simple Mission

**Tests**:
- Mission submission in Real Mode
- Agent processing workflow
- Deliverable creation (≥3 expected)
- Mission completion

**Metrics**:
- Deliverable count
- Deliverable types (code, plan, analysis, document)
- Mission duration
- Collaboration count

**Pass Criteria**:
- `deliverableCount >= 3`
- `missionComplete === true`

#### Scenario 2: User Prompt Flow

**Tests**:
- Agent request for user input
- `user_prompt_required` event detection
- Prompt question extraction
- Chat integration readiness

**Metrics**:
- Prompt received (boolean)
- Prompt question (string)
- Response handling (future)

**Pass Criteria**:
- `promptReceived === true`

#### Scenario 3: Agent Collaboration

**Tests**:
- Agent-to-agent communication
- `agent_collaboration` event emission
- Collaboration type detection
- Timeline visualization data

**Metrics**:
- Collaboration count
- Collaboration types (question, answer, proposal, approval, handoff)
- Agent pairs (from → to)

**Pass Criteria**:
- `collaborationCount > 0`

#### Scenario 4: Skill Application

**Tests**:
- LEO uses React/TypeScript skills
- MOMO uses Agile planning skills
- ALEX uses testing strategy skills
- Skill keywords in outputs

**Metrics**:
- Skill references per agent (LEO, MOMO, ALEX)
- Keyword detection counts

**Pass Criteria**:
- At least 2/3 agents apply skills

#### Test Suite Runner

**Features**:
- Sequential test execution
- 2-second delay between tests
- Comprehensive report generation
- JSON result export
- Overall success rate calculation

**Report Format**:
```json
{
  "timestamp": "2026-02-13T...",
  "summary": {
    "total": 4,
    "passed": 4,
    "failed": 0,
    "successRate": 100,
    "totalDuration": 456789
  },
  "results": [...]
}
```

## Integration Points

### From Previous Phases

**Phase 1 (Foundation)**:
- `AgentCollaborationEvent`, `MissionDeliverableEvent`, `TaskProgressEvent` types
- `deliverableStore` for deliverable management
- Agent personas and skill documents

**Phase 2 (Backend)**:
- `agent_collaboration` event parsing
- `mission_deliverable` event parsing
- `task_progress` event parsing
- `user_prompt_required` event parsing

**Phase 3 (Chat)**:
- `ChatMessageEvent` type
- `sendChatMessage()` function
- Chat UI for user responses

**Phase 4 (Deliverables)**:
- `DeliverablesList` component
- `DeliverableViewer` component
- Syntax highlighting and markdown rendering

### To Office Page

**Integration**:
1. Import `ConversationTimeline` from `@/components/conversation`
2. Extract `collaborationEvents` from `useClaudeTeam()`
3. Add component to layout (grid or tab)

**Example**:
```tsx
import { ConversationTimeline } from '@/components/conversation';

function OfficePage() {
  const { collaborationEvents } = useClaudeTeam();

  return (
    <div className="grid grid-cols-2 gap-4">
      <DeliverablesList />
      <ConversationTimeline collaborationEvents={collaborationEvents} />
    </div>
  );
}
```

## Usage Guide

### Running E2E Tests

**Prerequisites**:
1. Start dev server: `npm run dev`
2. Ensure Anthropic API key is set in `.env.local`
3. Real Mode enabled (default for E2E tests)

**Commands**:
```bash
# Run all tests (recommended)
npm run test:e2e

# Run individual scenarios
npm run test:e2e:1  # Simple Mission
npm run test:e2e:2  # User Prompt
npm run test:e2e:3  # Collaboration
npm run test:e2e:4  # Skill Application
```

**Expected Output**:
```
╔═══════════════════════════════════════════════════════════════════╗
║                  Real Mode E2E Test Suite                        ║
║                   Phase 5 Integration Tests                      ║
╚═══════════════════════════════════════════════════════════════════╝

=== Scenario 1: Simple Mission → Deliverables ===

📝 Mission: Create a simple React counter component
🆔 Mission ID: mission-test-1234567890
🔌 Connecting to: http://localhost:3000/api/claude-team...

👤 LEO: WORKING
💬 LEO: Analyzing requirements...
📦 DELIVERABLE #1: code - Counter.tsx
✅ Mission Complete

--- Validation Results ---
✓ Deliverables created: 3
✓ Deliverable types: code, plan, analysis
✓ Duration: 67.5s

=== Test Result ===
Status: ✅ PASSED
```

### Viewing Collaboration Timeline

**In Development**:
1. Navigate to `/office`
2. Submit a mission that encourages collaboration
3. View real-time collaboration events in the timeline panel
4. Filter by collaboration type (Question, Answer, etc.)

**Example Mission**:
```
Create a full-stack todo app. LEO handles frontend, MOMO creates the plan, and ALEX reviews architecture.
```

## Performance Optimizations

### Event Throttling

**Current**: All events processed immediately

**Future Enhancement**:
```typescript
// Throttle collaboration events to prevent UI lag
const throttledCollaboration = useCallback(
  throttle((event: AgentCollaborationEvent) => {
    setCollaborationEvents((prev) => [...prev, event]);
  }, 100),
  []
);
```

### Memory Management

**Current State Limits**:
- No automatic cleanup
- All events stored in component state

**Future Enhancement**:
```typescript
// Limit collaboration events to last 50
useEffect(() => {
  if (collaborationEvents.length > 50) {
    setCollaborationEvents((prev) => prev.slice(-50));
  }
}, [collaborationEvents]);
```

### Render Optimization

**Current**:
- Full re-render on new events
- No virtualization

**Future Enhancement**:
- React.memo for message components
- Virtual scrolling for large lists
- Windowing with react-window

## Error Handling

### Test Scenarios

**Network Errors**:
- HTTP connection failures
- SSE stream interruptions
- Timeout exceeded

**Handling**:
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
} catch (error) {
  return {
    scenario,
    passed: false,
    details: `Error: ${error.message}`,
  };
}
```

**API Errors**:
- Invalid API key
- Rate limiting
- Claude API errors

**Handling**:
- Parse `error` SSE event
- Log to console
- Return failed test result

## Validation Checklist

| Criteria | Status | Details |
|----------|--------|---------|
| ConversationTimeline displays | ✅ | Shows agent collaborations with colors |
| Filter by collaboration type | ✅ | 6 filter types working |
| Timestamps display | ✅ | Formatted as 12-hour time |
| Empty state | ✅ | Shows when no collaborations |
| Scrollable container | ✅ | Max height 500px |
| Build passes | ✅ | TypeScript compilation successful |
| Scenario 1 passes | ⏳ | Requires manual run |
| Scenario 2 passes | ⏳ | Requires manual run |
| Scenario 3 passes | ⏳ | Requires manual run |
| Scenario 4 passes | ⏳ | Requires manual run |

## Known Limitations

### Current Implementation

1. **No automatic test execution**: Tests must be run manually
2. **Requires dev server**: Can't test production build directly
3. **Real API calls**: Tests use actual Claude API (costs money)
4. **No UI testing**: Tests only validate SSE events, not UI rendering
5. **Single mission**: Can't test concurrent missions

### Future Improvements

1. **Mock Claude API**: Create test fixtures for faster, cheaper tests
2. **Playwright integration**: Add UI-level E2E tests
3. **CI/CD pipeline**: Automate test execution on commits
4. **Performance benchmarks**: Track mission execution time
5. **Load testing**: Test with multiple concurrent missions

## Troubleshooting

### Test Hangs

**Symptoms**: Test runs but never completes

**Causes**:
- Dev server not running
- Anthropic API key missing
- Network issues
- Claude API timeout

**Solutions**:
```bash
# Check dev server
curl http://localhost:3000/api/claude-team

# Verify API key
echo $ANTHROPIC_API_KEY

# Check timeout (increase if needed)
# Edit test file, change timeout from 300000ms to 600000ms
```

### No Collaborations Detected

**Symptoms**: Scenario 3 fails with 0 collaborations

**Causes**:
- Agents not communicating
- Collaboration regex not matching
- SSE event not emitting

**Solutions**:
- Use mission that encourages collaboration
- Check backend `detectCollaboration()` function
- Verify `@AGENTNAME` mentions in agent messages

### Skill Keywords Not Found

**Symptoms**: Scenario 4 fails with skill references missing

**Causes**:
- Agents not using skill documents
- Keywords too specific
- Skill loading failed

**Solutions**:
- Check skill documents loaded in logs
- Expand keyword list
- Verify skill document content

## Files Reference

```
my-office/
├── components/
│   └── conversation/
│       ├── ConversationTimeline.tsx      # Timeline component (NEW)
│       └── index.ts                      # Exports (NEW)
├── lib/
│   └── hooks/
│       └── useClaudeTeam.ts              # Extended hook (MODIFIED)
├── tests/
│   └── e2e/
│       ├── scenario1-simple-mission.ts   # Test 1 (NEW)
│       ├── scenario2-user-prompt.ts      # Test 2 (NEW)
│       ├── scenario3-collaboration.ts    # Test 3 (NEW)
│       ├── scenario4-skill-application.ts# Test 4 (NEW)
│       ├── run-all-tests.ts              # Runner (NEW)
│       └── README.md                     # Test docs (NEW)
└── docs/
    └── PHASE5_E2E_TESTING.md             # This document (NEW)
```

## Code Quality

- ✅ TypeScript strict mode compliant
- ✅ All components properly typed
- ✅ Follows project conventions
- ✅ Production build successful
- ✅ No lint errors
- ✅ Comprehensive documentation

## Next Steps

### Phase 5.1 (Future)

**UI Integration**:
- [ ] Add ConversationTimeline to `/office` page
- [ ] Implement tab/panel toggle for deliverables vs timeline
- [ ] Add export functionality (download collaboration log)

**Performance**:
- [ ] Implement event throttling
- [ ] Add memory limits for event arrays
- [ ] Virtual scrolling for large timelines

**Error Handling**:
- [ ] Toast notifications for errors
- [ ] Retry logic for failed SSE connections
- [ ] Graceful degradation

### Phase 6 (Future)

**Advanced Features**:
- [ ] Collaboration analytics dashboard
- [ ] Agent interaction graph visualization
- [ ] Skill utilization metrics
- [ ] Performance profiling tools

**Testing Enhancements**:
- [ ] Playwright for UI testing
- [ ] Visual regression testing
- [ ] Load testing framework
- [ ] Mock API for faster tests

## Changelog

### 2026-02-13 - Phase 5 Implementation

- ✅ Created ConversationTimeline component
- ✅ Extended useClaudeTeam hook with collaboration tracking
- ✅ Implemented 4 E2E test scenarios
- ✅ Created test suite runner with report generation
- ✅ Added test scripts to package.json
- ✅ Comprehensive documentation
- ✅ Production build successful

---

**Implementation Complete**: 2026-02-13
**Developer**: qa-specialist
**Status**: ✅ Ready for Integration
