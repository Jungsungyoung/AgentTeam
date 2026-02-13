# Code Review Checklist

**Priority: 2**

## Review Process Overview

### Goals of Code Review
1. Catch bugs and logic errors
2. Ensure code quality and maintainability
3. Verify security best practices
4. Share knowledge across team
5. Maintain consistent code style

### Review Mindset
- Be constructive, not critical
- Focus on the code, not the person
- Ask questions to understand intent
- Suggest alternatives, don't demand changes
- Acknowledge good work

## Code Review Checklist

### 1. Functionality

**Does it work correctly?**
- [ ] Code implements requirements as specified
- [ ] Logic is correct and complete
- [ ] Edge cases are handled
- [ ] Error conditions are covered
- [ ] No obvious bugs or logic errors

**Testing**
- [ ] Tests are included and pass
- [ ] Test coverage is adequate (80%+)
- [ ] Tests verify the right behavior
- [ ] Edge cases are tested

### 2. Security

**Common Vulnerabilities**
- [ ] No SQL injection risks (use parameterized queries)
- [ ] No XSS vulnerabilities (sanitize user input)
- [ ] No CSRF vulnerabilities (use tokens)
- [ ] Secrets not hardcoded (use environment variables)
- [ ] Authentication/authorization properly implemented
- [ ] Input validation on all user data
- [ ] Output encoding for untrusted data

**Example Issues:**
```typescript
// ❌ Bad - SQL injection risk
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Good - Parameterized query
const query = `SELECT * FROM users WHERE id = ?`;
db.query(query, [userId]);

// ❌ Bad - XSS risk
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Good - Escaped output
<div>{userInput}</div>
```

### 3. Performance

**Efficiency**
- [ ] No unnecessary re-renders (React)
- [ ] Proper use of memoization where needed
- [ ] Efficient algorithms (avoid O(n²) when possible)
- [ ] Appropriate data structures
- [ ] No memory leaks (cleanup in useEffect)
- [ ] Database queries optimized

**Example Issues:**
```typescript
// ❌ Bad - Creates new function on every render
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Good - Stable reference
const onClick = useCallback(() => handleClick(id), [id]);
<button onClick={onClick}>Click</button>

// ❌ Bad - Subscribes to entire store
const { agents, missions, logs } = useStore();

// ✅ Good - Selective subscription
const agents = useStore(state => state.agents);
```

### 4. Code Quality

**Readability**
- [ ] Code is easy to understand
- [ ] Variable names are descriptive
- [ ] Functions are small and focused
- [ ] Comments explain "why", not "what"
- [ ] No magic numbers (use named constants)
- [ ] Consistent formatting

**Maintainability**
- [ ] No code duplication (DRY principle)
- [ ] Single responsibility principle followed
- [ ] Dependencies are minimal and clear
- [ ] Code is modular and testable
- [ ] Technical debt is documented

**Example Issues:**
```typescript
// ❌ Bad - Magic number, unclear purpose
if (x > 86400000) { ... }

// ✅ Good - Named constant
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
if (x > ONE_DAY_MS) { ... }

// ❌ Bad - Function does too much
function processUserData(user) {
  // 50 lines of mixed logic
}

// ✅ Good - Single responsibility
function validateUser(user) { ... }
function enrichUserData(user) { ... }
function saveUser(user) { ... }
```

### 5. Type Safety (TypeScript)

**Type Usage**
- [ ] No `any` types (use `unknown` if needed)
- [ ] Proper type annotations where inference isn't clear
- [ ] Interfaces/types defined for complex objects
- [ ] Generic types used appropriately
- [ ] Type guards for runtime checks

**Example Issues:**
```typescript
// ❌ Bad - Using any
function handleData(data: any) { ... }

// ✅ Good - Proper types
interface UserData {
  id: string;
  name: string;
}
function handleData(data: UserData) { ... }

// ❌ Bad - Missing type safety
const item = items.find(i => i.id === id);
item.name; // Could be undefined!

// ✅ Good - Type guard
const item = items.find(i => i.id === id);
if (item) {
  item.name; // Safe
}
```

### 6. Error Handling

**Robustness**
- [ ] Errors are caught and handled appropriately
- [ ] User-friendly error messages
- [ ] Errors are logged for debugging
- [ ] No silent failures
- [ ] Async errors handled with try/catch
- [ ] Loading and error states in UI

**Example Issues:**
```typescript
// ❌ Bad - Unhandled promise rejection
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// ✅ Good - Proper error handling
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
```

### 7. Architecture

**Design Patterns**
- [ ] Follows project's established patterns
- [ ] Component structure is logical
- [ ] State management is appropriate
- [ ] API design is RESTful/consistent
- [ ] Separation of concerns maintained

**Project-Specific**
- [ ] Follows CLAUDE.md guidelines
- [ ] Uses project's path aliases (@/)
- [ ] Matches existing code style
- [ ] Integrates with existing systems

### 8. Documentation

**Code Documentation**
- [ ] Complex logic has explanatory comments
- [ ] Public APIs are documented
- [ ] JSDoc comments for functions (if needed)
- [ ] README updated if needed
- [ ] Migration guide for breaking changes

## Review Priority Levels

### P0 (Critical) - Must Fix
- Security vulnerabilities
- Bugs that break core functionality
- Data loss or corruption risks
- Performance issues that impact users

### P1 (Important) - Should Fix
- Code quality issues
- Maintainability concerns
- Missing tests
- Type safety problems

### P2 (Nice to Have) - Consider Fixing
- Minor style inconsistencies
- Optimization opportunities
- Refactoring suggestions
- Documentation improvements

## Code Review Comments Template

### Asking Questions
```
Q: Why did you choose approach X over Y?
Context: Y seems more straightforward here.
```

### Suggesting Changes
```
Suggestion: Consider using useCallback here to prevent re-renders.
Example:
  const onClick = useCallback(() => {...}, [deps]);
```

### Flagging Issues
```
Issue (P0): SQL injection vulnerability
Line 42: User input is directly interpolated into SQL query.
Fix: Use parameterized queries instead.
```

### Acknowledging Good Work
```
Nice! This is a clean implementation of the state pattern.
```

## When to Apply This Checklist

Use this checklist when:
- Reviewing code from LEO or other agents
- Creating analysis deliverables
- Validating implementations
- Identifying risks and technical debt
- Providing feedback on implementations

Always be thorough but constructive in your reviews.
