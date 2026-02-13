# Real Mode E2E Test Suite

## Overview

This directory contains end-to-end (E2E) integration tests for the Real Mode Claude API integration. The test suite validates the complete workflow from mission submission through agent collaboration to deliverable creation.

## Test Scenarios

### Scenario 1: Simple Mission → Deliverables

**File**: `scenario1-simple-mission.ts`

**Purpose**: Verify basic mission execution flow

**Tests**:
- ✅ User can submit a mission in Real Mode
- ✅ Agents process the mission
- ✅ At least 3 deliverables are created (plan, code, analysis)
- ✅ Mission completes successfully

**Expected Output**:
- Minimum 3 deliverables
- Mission complete event received
- All SSE events stream correctly

**Run**:
```bash
npm run test:e2e:1
```

---

### Scenario 2: User Prompt Flow

**File**: `scenario2-user-prompt.ts`

**Purpose**: Verify user prompt handling

**Tests**:
- ✅ Agent requests user input via `[USER_PROMPT]` tag
- ✅ `user_prompt_required` event is emitted
- ✅ User can respond via chat (integration point)
- ✅ Mission continues after response

**Expected Output**:
- `user_prompt_required` SSE event detected
- Prompt question extracted
- Event logged to terminal

**Run**:
```bash
npm run test:e2e:2
```

---

### Scenario 3: Agent Collaboration

**File**: `scenario3-collaboration.ts`

**Purpose**: Verify agent-to-agent communication

**Tests**:
- ✅ Agents communicate with each other during mission
- ✅ `agent_collaboration` events are emitted
- ✅ Different collaboration types detected (question, answer, proposal, approval, handoff)
- ✅ ConversationTimeline can visualize interactions

**Expected Output**:
- At least 1 collaboration event
- Multiple collaboration types
- Agent @mentions detected

**Run**:
```bash
npm run test:e2e:3
```

---

### Scenario 4: Skill Application

**File**: `scenario4-skill-application.ts`

**Purpose**: Verify agents use their skill documents

**Tests**:
- ✅ LEO uses React/TypeScript best practices
- ✅ MOMO uses Agile planning methodology
- ✅ ALEX uses testing strategies
- ✅ Skill keywords appear in agent outputs

**Expected Output**:
- At least 2/3 agents apply their skills
- Skill keywords detected in messages/deliverables
- Agents reference skill documents

**Run**:
```bash
npm run test:e2e:4
```

---

## Running Tests

### Prerequisites

1. **Dev server running**: The tests connect to `http://localhost:3000`
   ```bash
   npm run dev
   ```

2. **Anthropic API key**: Set in `.env.local`
   ```env
   ANTHROPIC_API_KEY=your-key-here
   ```

3. **Real Mode enabled**: Tests use Real Mode for authentic AI agent behavior

### Run All Tests

```bash
npm run test:e2e
```

This executes all 4 scenarios sequentially and generates a comprehensive report.

### Run Individual Tests

```bash
npm run test:e2e:1  # Simple Mission
npm run test:e2e:2  # User Prompt
npm run test:e2e:3  # Collaboration
npm run test:e2e:4  # Skill Application
```

### Test Output

**Console Output**:
- Real-time event logging
- Progress indicators
- Validation results
- Final pass/fail status

**JSON Report**:
- Saved to `test-results-{timestamp}.json`
- Includes all metrics and details
- Can be used for CI/CD integration

## Test Architecture

### Technology Stack

- **Runtime**: Node.js with tsx (TypeScript execution)
- **HTTP Client**: node:fetch (built-in)
- **SSE Parsing**: Manual implementation (TextDecoder + event parsing)
- **Assertions**: Custom validation logic

### Test Structure

Each test scenario follows this pattern:

1. **Setup**: Define mission and parameters
2. **Connect**: Open SSE connection to `/api/claude-team`
3. **Stream**: Process SSE events in real-time
4. **Validate**: Check expected events occurred
5. **Report**: Return structured test result

### Event Types Monitored

- `agent_status` - Agent state changes
- `team_log` - System logs
- `agent_message` - Agent outputs
- `agent_collaboration` - Agent-to-agent communication
- `mission_deliverable` - Deliverables created
- `task_progress` - Task execution progress
- `user_prompt_required` - User input needed
- `chat_message` - User-agent chat
- `mission_complete` - Mission finished
- `error` - Error events

## Performance Expectations

### Test Duration

- **Scenario 1**: 60-120 seconds (depends on mission complexity)
- **Scenario 2**: 60-90 seconds
- **Scenario 3**: 90-150 seconds (collaboration takes time)
- **Scenario 4**: 60-120 seconds
- **Full Suite**: 5-8 minutes

### Timeouts

- Individual test timeout: 5 minutes (300 seconds)
- Connection timeout: 30 seconds
- Stream read timeout: 2 minutes

## Success Criteria

### Scenario 1
- ✅ `deliverableCount >= 3`
- ✅ `missionComplete === true`

### Scenario 2
- ✅ `promptReceived === true`

### Scenario 3
- ✅ `collaborationCount > 0`
- ✅ Multiple collaboration types detected

### Scenario 4
- ✅ At least 2/3 agents applied skills
- ✅ Skill keywords found in outputs

## Troubleshooting

### Test hangs or times out

**Possible causes**:
- Dev server not running
- Anthropic API key missing/invalid
- Network connectivity issues
- Claude API rate limits

**Solutions**:
```bash
# Check dev server
curl http://localhost:3000/api/claude-team

# Verify API key
echo $ANTHROPIC_API_KEY

# Check logs
tail -f .next/server.log
```

### Tests fail with "No deliverables"

**Possible causes**:
- Agents not creating deliverables
- Deliverable parsing not working
- SSE event stream issues

**Solutions**:
- Check agent output in console
- Verify deliverable format `[DELIVERABLE:type:title]...[/DELIVERABLE]`
- Review Phase 2 backend implementation

### Collaboration events not detected

**Possible causes**:
- Agents not communicating
- Collaboration detection regex not matching
- SSE event not emitting

**Solutions**:
- Use mission that encourages collaboration
- Check backend collaboration detection logic
- Verify `agent_collaboration` event format

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - run: npm run dev &
      - run: sleep 10
      - run: npm run test:e2e
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Future Enhancements

### Phase 5.1 (Future)

- [ ] Playwright/Puppeteer integration for UI testing
- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] Load testing (multiple concurrent missions)
- [ ] Error injection testing
- [ ] Retry logic testing

### Phase 5.2 (Future)

- [ ] Test data fixtures
- [ ] Mock Claude API for faster tests
- [ ] Snapshot testing for deliverables
- [ ] Code coverage reporting
- [ ] Test parallelization

## Related Documentation

- [Phase 2: Backend Implementation](../../docs/PHASE2_BACKEND_IMPLEMENTATION.md)
- [Phase 3: Chat System](../../docs/PHASE3_CHAT_IMPLEMENTATION.md)
- [Phase 4: Deliverables UI](../../docs/DELIVERABLES_UI_GUIDE.md)
- [Phase 5: Implementation Guide](../../docs/PHASE5_E2E_TESTING.md)

---

**Last Updated**: 2026-02-13
**Version**: 1.0.0
**Maintainer**: QA Specialist Team
