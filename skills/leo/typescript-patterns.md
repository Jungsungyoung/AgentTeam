# TypeScript Patterns

**Priority: 2**

## Type Safety Principles

### 1. Strict Mode Configuration
Always work with TypeScript strict mode enabled:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`

### 2. Type Inference
Let TypeScript infer types when obvious, be explicit when clarity is needed:

```typescript
// ✅ Good - Inference is clear
const count = 5;
const agents = useAgentStore(state => state.agents);

// ✅ Good - Explicit when needed
const result: Promise<Agent[]> = fetchAgents();

// ❌ Bad - Unnecessary explicit type
const count: number = 5;
```

### 3. Union Types and Discriminated Unions

Use union types for related but distinct values:

```typescript
// ✅ Good - Discriminated union
type DeliverableType = 'code' | 'document' | 'analysis' | 'plan';

interface CodeDeliverable {
  type: 'code';
  language: string;
  content: string;
}

interface DocumentDeliverable {
  type: 'document';
  format: 'markdown' | 'plain';
  content: string;
}

type Deliverable = CodeDeliverable | DocumentDeliverable;

// TypeScript can narrow types
function handleDeliverable(d: Deliverable) {
  if (d.type === 'code') {
    // d.language is available here
  }
}
```

### 4. Generic Types

Use generics for reusable, type-safe code:

```typescript
// ✅ Good - Generic function
function getById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// ✅ Good - Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}
```

### 5. Utility Types

Leverage built-in utility types:

```typescript
// Partial - Make all properties optional
type PartialAgent = Partial<Agent>;

// Pick - Select specific properties
type AgentSummary = Pick<Agent, 'id' | 'name' | 'role'>;

// Omit - Exclude specific properties
type AgentWithoutPosition = Omit<Agent, 'x' | 'y'>;

// Record - Key-value pairs
type AgentMap = Record<AgentId, Agent>;

// ReturnType - Extract function return type
type StoreState = ReturnType<typeof useAgentStore.getState>;
```

### 6. Type Guards

Create type guards for runtime type checking:

```typescript
// ✅ Good - Type guard
function isCodeDeliverable(d: Deliverable): d is CodeDeliverable {
  return d.type === 'code';
}

// Usage
if (isCodeDeliverable(deliverable)) {
  console.log(deliverable.language); // Type-safe
}
```

### 7. Avoid Type Assertions

Minimize use of `as` type assertions:

```typescript
// ❌ Bad - Unsafe assertion
const agent = data as Agent;

// ✅ Good - Validation + type guard
function isAgent(data: unknown): data is Agent {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}

if (isAgent(data)) {
  // data is safely typed as Agent
}
```

## Common Patterns in This Project

### Store Selectors
```typescript
// ✅ Good - Typed selector
const agents = useAgentStore(state => state.agents);
const updateAgent = useAgentStore(state => state.updateAgent);
```

### Event Handlers
```typescript
// ✅ Good - Explicit event type
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // ...
};
```

### API Responses
```typescript
// ✅ Good - Type the response
interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function fetchMissions(): Promise<ApiResponse<Mission[]>> {
  // ...
}
```

## When to Apply These Patterns

Use these patterns consistently in all TypeScript code. Prioritize type safety over convenience, and leverage the type system to catch errors at compile time rather than runtime.
