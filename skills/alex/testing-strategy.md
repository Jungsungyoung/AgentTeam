# Testing Strategy

**Priority: 1**

## Testing Pyramid

```
         /\
        /E2E\      ← Few (5-10%)
       /------\
      /Integ. \   ← Some (20-30%)
     /----------\
    /   Unit     \ ← Many (60-70%)
   /--------------\
```

### Unit Tests
- Test individual functions and components
- Fast execution (< 1ms each)
- High coverage (80%+ target)
- Mock external dependencies

### Integration Tests
- Test component interactions
- Test API endpoints with database
- Test state management flows
- Medium speed (< 100ms each)

### E2E Tests
- Test complete user flows
- Use real browser (Playwright)
- Test critical paths only
- Slower execution (seconds)

## Testing Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
test('should update agent status when mission starts', () => {
  // Arrange
  const store = createTestStore();
  const agentId = 'leo';

  // Act
  store.setAgentStatus(agentId, 'WORKING');

  // Assert
  expect(store.getState().agents[agentId].status).toBe('WORKING');
});
```

### 2. What to Test

**DO Test:**
- Public API/interface
- Edge cases and error conditions
- Business logic
- Integration points
- Critical user flows

**DON'T Test:**
- Implementation details
- Third-party libraries
- Trivial getters/setters
- Generated code

### 3. Test Naming Convention

Use descriptive test names:

```typescript
// ✅ Good
test('should create deliverable when agent sends formatted message', () => {});
test('should throw error when mission ID is invalid', () => {});
test('should display loading state while fetching data', () => {});

// ❌ Bad
test('deliverable creation', () => {});
test('error handling', () => {});
test('loading', () => {});
```

## Testing Patterns for This Project

### Zustand Store Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDeliverableStore } from '@/lib/store/deliverableStore';

describe('DeliverableStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useDeliverableStore.getState().clearDeliverables();
  });

  test('should add deliverable', () => {
    const { result } = renderHook(() => useDeliverableStore());

    act(() => {
      result.current.addDeliverable({
        id: '1',
        type: 'code',
        title: 'Test.tsx',
        content: 'code here',
        agentId: 'leo',
        missionId: 'mission-1',
        createdAt: new Date(),
      });
    });

    expect(result.current.deliverables).toHaveLength(1);
  });
});
```

### React Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeliverableCard } from '@/components/deliverables/DeliverableCard';

describe('DeliverableCard', () => {
  const mockDeliverable = {
    id: '1',
    type: 'code' as const,
    title: 'LoginButton.tsx',
    content: 'export function LoginButton() {}',
    agentId: 'leo' as const,
    missionId: 'mission-1',
    createdAt: new Date(),
  };

  test('should display deliverable title', () => {
    render(<DeliverableCard deliverable={mockDeliverable} />);
    expect(screen.getByText('LoginButton.tsx')).toBeInTheDocument();
  });

  test('should call onDownload when download button clicked', async () => {
    const onDownload = jest.fn();
    render(<DeliverableCard deliverable={mockDeliverable} onDownload={onDownload} />);

    await userEvent.click(screen.getByRole('button', { name: /download/i }));
    expect(onDownload).toHaveBeenCalledWith(mockDeliverable);
  });
});
```

### API Route Testing

```typescript
import { POST } from '@/app/api/claude-team/chat/route';

describe('/api/claude-team/chat', () => {
  test('should return 400 when agentId is missing', async () => {
    const request = new Request('http://localhost:3000/api/claude-team/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'hello' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test('should stream response from agent', async () => {
    const request = new Request('http://localhost:3000/api/claude-team/chat', {
      method: 'POST',
      body: JSON.stringify({
        agentId: 'leo',
        message: 'Write a button component',
        missionId: 'mission-1',
      }),
    });

    const response = await POST(request);
    expect(response.headers.get('content-type')).toBe('text/event-stream');
  });
});
```

## E2E Testing Strategy

### Critical User Flows

1. **Mission Execution Flow**
   - User submits mission
   - Agents process mission
   - Deliverables are created
   - Mission completes successfully

2. **Chat Flow**
   - User sends message to agent
   - Agent responds
   - Chat history persists

3. **Error Handling Flow**
   - Invalid input shows error
   - Network error handled gracefully
   - User can retry after error

### E2E Test Example (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('complete mission execution flow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');

  // Submit mission
  await page.fill('[data-testid="mission-input"]', 'Create a login button');
  await page.click('[data-testid="submit-mission"]');

  // Wait for mission processing
  await expect(page.locator('[data-testid="mission-status"]')).toHaveText('processing');

  // Wait for completion
  await expect(page.locator('[data-testid="mission-status"]')).toHaveText('completed', {
    timeout: 30000,
  });

  // Check deliverables
  await expect(page.locator('[data-testid="deliverable-card"]')).toHaveCount(3);
});
```

## Test Coverage Goals

### Minimum Coverage Targets
- Unit tests: 80% coverage
- Integration tests: 60% coverage
- E2E tests: Critical paths only

### What Needs High Coverage
- Business logic (90%+)
- State management (85%+)
- API routes (80%+)
- Utility functions (90%+)

### What Can Have Lower Coverage
- UI components (60%+)
- Configuration files (40%+)
- Type definitions (N/A)

## Test Quality Checklist

For each test, verify:
- [ ] Tests one specific behavior
- [ ] Has clear arrange-act-assert structure
- [ ] Uses descriptive test name
- [ ] Cleans up after itself
- [ ] Runs fast (< 1s for unit tests)
- [ ] Is independent (can run alone)
- [ ] Tests behavior, not implementation
- [ ] Fails when expected behavior breaks

## When to Write Tests

### Test-First (TDD)
Write tests before implementation for:
- Business logic functions
- Utility functions
- Critical algorithms

### Test-After
Write tests after implementation for:
- UI components (easier after seeing it work)
- Experimental features
- Prototypes

### Test-During
Write tests alongside implementation for:
- API endpoints
- State management
- Integration points

## When to Apply This Strategy

Use this testing approach when:
- Validating new implementations
- Creating analysis deliverables
- Reviewing code quality
- Identifying risks and issues
- Planning testing phases

Always advocate for comprehensive testing while being pragmatic about coverage goals.
