# Claude Code CLI Wrapper

Node.js wrapper for managing Claude Code CLI as a child process. Enables real-time agent team management, task assignment, and event streaming.

## Installation

The wrapper is part of the my-office project and does not require separate installation.

## Usage

### Basic Setup

```typescript
import { ClaudeCodeWrapper } from '@/lib/claude-code';

const wrapper = new ClaudeCodeWrapper({
  cliPath: 'claude-code', // Path to CLI binary
  workingDirectory: process.cwd(),
  timeout: 300000, // 5 minutes
  maxBufferSize: 10 * 1024 * 1024, // 10MB
});
```

### Create a Team

```typescript
const result = await wrapper.createTeam({
  teamName: 'my-office-phase2',
  agents: ['leo', 'momo', 'alex'],
  maxAgents: 5,
});

if (result.success) {
  console.log(`Team created: ${result.data?.teamName}`);
}
```

### Create a Task

```typescript
const taskResult = await wrapper.createTask({
  teamName: 'my-office-phase2',
  subject: 'Implement feature X',
  description: 'Detailed task description...',
  activeForm: 'Implementing feature X',
});
```

### Send a Message

```typescript
await wrapper.sendMessage({
  teamName: 'my-office-phase2',
  recipient: 'leo',
  message: 'Start working on the authentication module',
  type: 'message',
});
```

### Monitor Team Activity

```typescript
// Start monitoring
await wrapper.monitorTeam('my-office-phase2');

// Listen for events
wrapper.on('teamEvent', (event) => {
  console.log(`[${event.type}]`, event.data);
});

// Listen for specific event types
wrapper.on('event:AGENT_MESSAGE', (event) => {
  console.log('Agent message:', event.data);
});

// Listen for team-specific output
wrapper.on('team:my-office-phase2:output', (event) => {
  console.log('Team output:', event.rawOutput);
});
```

### Shutdown

```typescript
// Shutdown specific team
await wrapper.shutdownTeam('my-office-phase2');

// Shutdown all teams
await wrapper.shutdownAll();
```

## Event Types

The wrapper emits the following events:

- `TEAM_CREATED` - Team successfully created
- `TEAM_ERROR` - Team operation error
- `AGENT_MESSAGE` - Agent sent a message
- `AGENT_STATUS` - Agent status changed
- `TASK_CREATED` - New task created
- `TASK_UPDATED` - Task status updated
- `STDOUT` - Raw stdout from CLI
- `STDERR` - Raw stderr from CLI

## Event Listeners

```typescript
// Global team event listener
wrapper.on('teamEvent', (event: TeamEvent) => {
  // Handle any team event
});

// Specific event type
wrapper.on('event:AGENT_MESSAGE', (event: AgentMessageEvent) => {
  const { agentId, message } = event.data;
  console.log(`${agentId}: ${message}`);
});

// Team-specific output
wrapper.on('team:my-office-phase2:output', (event: TeamEvent) => {
  console.log(event.rawOutput);
});

// Team exit
wrapper.on('teamExit', ({ teamName, code, signal }) => {
  console.log(`Team ${teamName} exited with code ${code}`);
});
```

## Error Handling

```typescript
try {
  const result = await wrapper.createTeam({
    teamName: 'my-team',
  });

  if (!result.success) {
    console.error('Team creation failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Team Management

```typescript
// Get team status
const status = wrapper.getTeamStatus('my-office-phase2');
console.log(status?.status); // 'running' | 'stopped' | 'error'

// Get all active teams
const teams = wrapper.getActiveTeams();
console.log('Active teams:', teams);
```

## Architecture

```
ClaudeCodeWrapper
├── createTeam()       - Spawn team via CLI
├── createTask()       - Create team task
├── sendMessage()      - Send message to agent
├── monitorTeam()      - Start monitoring team output
├── shutdownTeam()     - Gracefully shutdown team
└── shutdownAll()      - Shutdown all teams

Event Flow:
CLI Process → stdout/stderr → parseOutput() → emit events → listeners
```

## Phase 2 Roadmap

Current implementation provides basic CLI execution and process management.

**Week 2 Enhancements:**
- Sophisticated output parsing (JSON extraction)
- Agent message detection and extraction
- Task status tracking
- Real-time log streaming

**Week 3 Enhancements:**
- Retry logic and error recovery
- Process health monitoring
- Performance metrics
- Advanced logging

## Example: Full Workflow

```typescript
import { ClaudeCodeWrapper } from '@/lib/claude-code';

async function runTeam() {
  const wrapper = new ClaudeCodeWrapper();

  // Create team
  await wrapper.createTeam({
    teamName: 'demo-team',
    agents: ['leo', 'momo'],
  });

  // Start monitoring
  await wrapper.monitorTeam('demo-team');

  wrapper.on('event:AGENT_MESSAGE', (event) => {
    console.log('Agent:', event.data);
  });

  // Create task
  await wrapper.createTask({
    teamName: 'demo-team',
    subject: 'Build authentication',
    description: 'Implement JWT-based auth',
  });

  // Let it run...
  await new Promise((resolve) => setTimeout(resolve, 60000));

  // Cleanup
  await wrapper.shutdownAll();
}

runTeam().catch(console.error);
```

## Testing

To test the wrapper locally:

```bash
cd my-office
node -r esbuild-register test-wrapper.ts
```

## Requirements

- Node.js 18+
- Claude Code CLI installed and accessible in PATH
- TypeScript 5+

## Limitations (Phase 1)

- Output parsing is basic (TODO: Week 2)
- No retry logic for failed commands
- Limited error context in events
- No process health monitoring

These will be addressed in subsequent weeks.
