# React Best Practices

**Priority: 1**

## Core Principles

### 1. Component Design
- Use functional components with hooks (no class components)
- Keep components small and focused (single responsibility)
- Prefer composition over inheritance
- Extract reusable logic into custom hooks

### 2. TypeScript Integration
- Always use TypeScript strict mode
- Define explicit prop types with interfaces
- Avoid `any` type - use `unknown` if needed
- Use generic types for reusable components

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick} className={variant}>{children}</button>;
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### 3. State Management
- Use Zustand for global state (already in project)
- Use selective subscriptions to prevent re-renders
- Keep state as local as possible
- Avoid prop drilling with context or Zustand

```typescript
// ✅ Good - Selective subscription
const agents = useAgentStore(state => state.agents);

// ❌ Bad - Entire store subscription
const { agents, logs, missions } = useAgentStore();
```

### 4. Performance Optimization
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Avoid creating functions in render
- Use useCallback for event handlers passed to children

### 5. File Organization
- Co-locate related files (component + styles + tests)
- Use index.ts for clean imports
- Keep utilities separate from components
- Follow the project structure in CLAUDE.md

## Next.js Specific

### App Router Patterns
- Use Server Components by default
- Mark interactive components with 'use client'
- Leverage server actions for mutations
- Optimize images with next/image

### Path Aliases
- Always use `@/` path alias
- Never use relative imports beyond parent directory

```typescript
// ✅ Good
import { Agent } from '@/lib/types/agent';
import { useAgentStore } from '@/lib/store/agentStore';

// ❌ Bad
import { Agent } from '../../../lib/types/agent';
```

## Code Quality

### Naming Conventions
- PascalCase for components: `AgentCard`, `MissionPanel`
- camelCase for functions: `handleClick`, `fetchData`
- UPPER_SNAKE_CASE for constants: `MAX_AGENTS`, `API_ENDPOINT`

### Error Handling
- Always handle async errors
- Provide user feedback on errors
- Log errors for debugging
- Use error boundaries for component errors

## When to Apply These Practices

Apply these practices in all React/Next.js code you write. If you see code that violates these principles, suggest improvements but don't refactor unless explicitly requested.
