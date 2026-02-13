# Agile Planning Methodology

**Priority: 1**

## Core Agile Principles

### 1. Sprint Planning
- Break work into 1-2 week sprints
- Define clear sprint goals
- Estimate using story points or time
- Identify dependencies early

### 2. User Story Format

Always write user stories in this format:

```
As a [user type],
I want to [action],
So that [benefit].
```

Example:
```
As a developer,
I want to see agent collaboration in real-time,
So that I can understand the AI team's decision-making process.
```

### 3. Task Breakdown Strategy

Break down features into implementation phases:

**Phase 1: Foundation**
- Core data structures
- Basic UI scaffolding
- Essential APIs

**Phase 2: Core Features**
- Primary user flows
- Key interactions
- Core functionality

**Phase 3: Enhancement**
- Advanced features
- Optimizations
- Polish and refinement

**Phase 4: Quality**
- Testing
- Bug fixes
- Documentation

### 4. Acceptance Criteria

Define clear, testable acceptance criteria for each user story:

```
✅ Acceptance Criteria:
1. User can submit a mission via text input
2. Mission appears in the mission list
3. Mission status updates in real-time
4. Completed missions show deliverables
```

## Planning Templates

### Feature Planning Template

```markdown
# Feature: [Feature Name]

## Overview
Brief description of the feature and its value.

## User Stories
1. As a [user], I want to [action], so that [benefit]
2. ...

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Task 1.1: Setup data structures
- [ ] Task 1.2: Create basic UI
- [ ] Task 1.3: Wire up state management

### Phase 2: Core Features (Days 3-5)
- [ ] Task 2.1: Implement main functionality
- [ ] Task 2.2: Add user interactions
- [ ] Task 2.3: Connect to backend

### Phase 3: Polish (Days 6-7)
- [ ] Task 3.1: Add error handling
- [ ] Task 3.2: Optimize performance
- [ ] Task 3.3: Write tests

## Dependencies
- Requires: [List dependencies]
- Blocks: [What this blocks]

## Risks
- Risk 1: Description and mitigation
- Risk 2: Description and mitigation

## Success Metrics
- Metric 1: Target value
- Metric 2: Target value
```

### Task Breakdown Example

For a feature like "Bidirectional Chat System":

```
## Epic: Bidirectional Chat System

### Story 1: User can send messages to agents
- Task 1.1: Create chat API endpoint
- Task 1.2: Implement message routing
- Task 1.3: Build message input UI
- Task 1.4: Add send button handler
- Task 1.5: Display sent messages

### Story 2: User receives agent responses
- Task 2.1: Setup SSE streaming
- Task 2.2: Parse agent responses
- Task 2.3: Display agent messages
- Task 2.4: Add typing indicators
- Task 2.5: Handle errors

### Story 3: User can view chat history
- Task 3.1: Create chat history store
- Task 3.2: Implement message persistence
- Task 3.3: Build history UI
- Task 3.4: Add scroll to bottom
- Task 3.5: Add timestamps
```

## Estimation Guidelines

### Story Points Scale
- 1 point: Simple change, < 2 hours
- 2 points: Small feature, 2-4 hours
- 3 points: Medium feature, 4-8 hours
- 5 points: Large feature, 1-2 days
- 8 points: Complex feature, 2-3 days
- 13+ points: Epic - needs breakdown

### T-Shirt Sizing (Alternative)
- XS: Trivial changes
- S: Small features
- M: Medium features
- L: Large features
- XL: Needs breakdown

## Prioritization Framework

### MoSCoW Method
- **Must Have**: Critical for MVP
- **Should Have**: Important but not critical
- **Could Have**: Nice to have
- **Won't Have**: Out of scope

### Priority Matrix
- **High Priority, High Value**: Do first
- **High Priority, Low Value**: Do if time permits
- **Low Priority, High Value**: Schedule for later
- **Low Priority, Low Value**: Don't do

## When to Apply This Methodology

Use this approach when:
- Planning new features or projects
- Breaking down complex missions
- Estimating effort and timelines
- Organizing team work
- Creating deliverables that include plans or roadmaps

Always structure your planning deliverables with clear phases, tasks, and acceptance criteria.
