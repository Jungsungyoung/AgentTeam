# Playwright E2E Tests for My Office

UI-level end-to-end tests for the My Office AI agent collaboration application.

## Overview

These Playwright tests verify critical user flows in the My Office application, including:

1. **Mission Submission** - Submit missions and watch agents collaborate
2. **Agent Chat** - Chat with LEO, MOMO, and ALEX
3. **Deliverables UI** - View code with syntax highlighting, download files
4. **Conversation Timeline** - See agent-to-agent collaboration

## Prerequisites

```bash
# Install dependencies (already done if you ran npm install)
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### All Tests

```bash
npm run test:playwright
```

### Specific Test Files

```bash
# Mission submission tests
npx playwright test tests/playwright/specs/01-mission-submission.spec.ts

# Agent chat tests
npx playwright test tests/playwright/specs/02-agent-chat.spec.ts

# Deliverables UI tests
npx playwright test tests/playwright/specs/03-deliverables.spec.ts

# Conversation timeline tests
npx playwright test tests/playwright/specs/04-conversation-timeline.spec.ts
```

### Development Mode

```bash
# Run with UI (interactive mode)
npm run test:playwright:ui

# Run in headed mode (see browser)
npm run test:playwright:headed

# Debug mode (step through tests)
npm run test:playwright:debug
```

## Test Structure

```
tests/playwright/
├── pages/                     # Page Object Models
│   ├── OfficePage.ts          # /office page
│   └── DeliverablesTestPage.ts # /deliverables-test page
├── specs/                     # Test specifications
│   ├── 01-mission-submission.spec.ts  # Mission flow
│   ├── 02-agent-chat.spec.ts          # Chat system
│   ├── 03-deliverables.spec.ts        # Deliverables UI
│   └── 04-conversation-timeline.spec.ts # Timeline
└── README.md                  # This file
```

## Test Scenarios

### 1. Mission Submission (01-mission-submission.spec.ts)

**Tests:**
- ✅ Office page loads with all zones
- ✅ Mission input interface displays
- ✅ Submit mission in simulation mode
- ✅ Agent pixel art displays in work zone
- ✅ Terminal log messages appear

**Critical Flow:**
1. User navigates to `/office`
2. User enters mission text
3. User selects simulation mode
4. User submits mission
5. Agents start processing
6. Terminal shows progress logs

### 2. Agent Chat (02-agent-chat.spec.ts)

**Tests:**
- ✅ Chat panel interface displays
- ✅ Agent selector shows LEO, MOMO, ALEX
- ✅ Send message to LEO
- ✅ Send message to MOMO
- ✅ Send message to ALEX
- ✅ Chat message history displays
- ✅ Typing indicator shows during response

**Critical Flow:**
1. User selects agent (LEO/MOMO/ALEX)
2. User types message
3. User sends message
4. Agent responds with personality
5. Message history updates

### 3. Deliverables UI (03-deliverables.spec.ts)

**Tests:**
- ✅ Deliverables test page loads
- ✅ Sample deliverable cards display
- ✅ Filter by type (All, Code, Document, Analysis, Plan)
- ✅ Open viewer with syntax highlighting
- ✅ Markdown rendering for documents
- ✅ Download functionality
- ✅ Type badges display
- ✅ Agent color indicators

**Critical Flow:**
1. User navigates to `/deliverables-test`
2. User sees deliverable cards
3. User filters by type (e.g., "Code")
4. User clicks "View" on deliverable
5. Viewer opens with syntax highlighting
6. User downloads deliverable
7. User closes viewer

### 4. Conversation Timeline (04-conversation-timeline.spec.ts)

**Tests:**
- ✅ Timeline component displays
- ✅ Collaboration filter options
- ✅ Events appear after mission
- ✅ Agent colors in messages
- ✅ Collaboration type badges
- ✅ Timestamps on events
- ✅ Filter by collaboration type
- ✅ Empty state when no collaborations
- ✅ Conversation flow (from → to)

**Critical Flow:**
1. User submits mission
2. Agents collaborate (LEO ↔ MOMO ↔ ALEX)
3. Timeline shows collaboration events
4. User filters by type (Question, Answer, etc.)
5. User sees agent-colored messages
6. Timestamps show when events occurred

## Page Object Model

### OfficePage

Represents the `/office` page with methods for:
- `goto()` - Navigate to office page
- `submitMission(text, mode)` - Submit a mission
- `chatWithAgent(agentId, message)` - Chat with an agent
- `waitForMissionComplete()` - Wait for mission to finish
- `getDeliverableCount()` - Count deliverables
- `getCollaborationEventCount()` - Count collaboration events
- `takeScreenshot(name)` - Capture screenshot

### DeliverablesTestPage

Represents the `/deliverables-test` page with methods for:
- `goto()` - Navigate to deliverables page
- `filterByType(type)` - Filter deliverables
- `openDeliverable(index)` - Open viewer
- `closeDeliverable()` - Close viewer
- `downloadDeliverable(index)` - Download file
- `getVisibleCardCount()` - Count visible cards
- `takeScreenshot(name)` - Capture screenshot

## Viewing Test Results

### HTML Report

```bash
npm run test:playwright:report
```

Opens interactive HTML report in browser with:
- Test results by browser
- Screenshots and videos of failures
- Detailed timing information
- Network activity

### Artifacts

Test artifacts are saved in:
- `playwright-report/` - HTML report
- `test-results/` - JSON, JUnit XML
- `test-results/screenshots/` - Screenshots
- `test-results/*-retry*/` - Videos and traces (on failure)

### Screenshots

All tests capture screenshots at key points:
```
test-results/screenshots/
├── 01-office-initial.png
├── 01-mission-processing.png
├── 02-chat-with-leo.png
├── 03-deliverable-cards.png
├── 04-timeline-component.png
└── ...
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm run test:playwright

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Browser Configuration

Tests run on 3 browsers by default:
- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop)
- ✅ WebKit (Desktop Safari)

Configure in `playwright.config.ts` to add:
- Mobile Chrome
- Mobile Safari
- Specific viewport sizes

## Troubleshooting

### Tests Fail with "Page not found"

Make sure dev server is running:
```bash
npm run dev
```

Playwright will auto-start dev server, but if it fails:
1. Check port 3000 is not in use
2. Verify `npm run dev` works manually
3. Check `playwright.config.ts` webServer config

### Selectors Not Found

Tests use fallback selectors for flexibility:
- `data-testid` attributes (preferred)
- Text content matching
- CSS class patterns

If UI changes, update selectors in Page Object Models.

### Screenshots Are Blank

Increase timeout before screenshot:
```typescript
await page.waitForTimeout(1000);
await officePage.takeScreenshot('name');
```

### Timeouts

Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

## Best Practices

**DO:**
- ✅ Use Page Object Model pattern
- ✅ Use `data-testid` attributes in components
- ✅ Wait for network idle before assertions
- ✅ Take screenshots at key points
- ✅ Use descriptive test names
- ✅ Run tests before merging PRs

**DON'T:**
- ❌ Use hardcoded waits (use `waitForSelector` instead)
- ❌ Test implementation details
- ❌ Ignore flaky tests
- ❌ Skip screenshot review on failures
- ❌ Use brittle CSS selectors

## Adding New Tests

1. **Create spec file** in `tests/playwright/specs/`
2. **Import Page Object** from `../pages/`
3. **Write test** using `test.describe()` and `test()`
4. **Add assertions** with `expect()`
5. **Take screenshots** at key points
6. **Run test** with `npx playwright test <file>`

Example:
```typescript
import { test, expect } from '@playwright/test';
import { OfficePage } from '../pages/OfficePage';

test.describe('New Feature', () => {
  test('should do something', async ({ page }) => {
    const officePage = new OfficePage(page);
    await officePage.goto();

    // Your test logic here

    await officePage.takeScreenshot('feature-test');
  });
});
```

## Related Documentation

- **Playwright Docs**: https://playwright.dev/
- **My Office Project**: `../../README.md`
- **API E2E Tests**: `../e2e/README.md` (Node.js fetch-based)
- **Phase 5 Documentation**: `../../docs/PHASE5_E2E_TESTING.md`

## Support

For questions or issues:
1. Check test screenshots in `test-results/screenshots/`
2. Review HTML report with `npm run test:playwright:report`
3. Run in debug mode with `npm run test:playwright:debug`
4. Check console output for errors

---

**Last Updated**: 2026-02-13
**Tests**: 30+ UI-level E2E scenarios
**Coverage**: Critical user flows for My Office
