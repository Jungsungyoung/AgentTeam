# React Hooks - My Office

This directory contains custom React hooks for the My Office application.

## useClaudeTeam

A React hook for managing Server-Sent Events (SSE) connections to the Claude Team Bridge Service.

### Purpose

The `useClaudeTeam` hook provides a clean interface for executing missions through the Bridge Service and receiving real-time updates via SSE. It automatically manages connection state, handles reconnection logic, and updates Zustand stores based on incoming events.

### Usage

```tsx
import { useClaudeTeam } from '@/lib/hooks/useClaudeTeam';

function MissionControl() {
  const { executeMission, isConnected, isProcessing, error, disconnect } = useClaudeTeam();

  const handleExecute = async () => {
    await executeMission('Build a landing page', 'real');
  };

  return (
    <div>
      <button onClick={handleExecute} disabled={isProcessing}>
        Execute Mission
      </button>
      {isConnected && <span>Connected</span>}
      {error && <span>Error: {error}</span>}
    </div>
  );
}
```

### API

#### Return Value

```typescript
interface UseClaudeTeamReturn {
  executeMission: (mission: string, mode: ExecutionMode) => Promise<void>;
  isConnected: boolean;
  isProcessing: boolean;
  error: string | null;
  disconnect: () => void;
}
```

- **executeMission**: Initiates a mission execution with the specified mode
  - `mission`: The mission description (string)
  - `mode`: Execution mode ('simulation', 'hybrid', or 'real')
  - Returns a Promise that resolves when the connection is established

- **isConnected**: Boolean indicating if the SSE connection is active

- **isProcessing**: Boolean indicating if a mission is currently being processed

- **error**: Error message string if an error occurred, otherwise null

- **disconnect**: Function to manually close the SSE connection

### Execution Modes

1. **Simulation** (`'simulation'`)
   - Fast, predictable behavior for testing and demos
   - No Claude API calls
   - Animations and state updates are simulated

2. **Hybrid** (`'hybrid'`)
   - Balanced approach
   - Simulated agent movement and animations
   - Real Claude API for decision-making and task distribution

3. **Real** (`'real'`)
   - Full Claude API integration
   - Authentic AI agent collaboration
   - Slower but provides genuine AI responses

### Event Handling

The hook automatically handles the following SSE event types:

#### agent_status
Updates agent status, position, and zone in `agentStore`.

```typescript
{
  type: 'agent_status',
  data: {
    agentId: 'leo',
    status: 'WORKING',
    zone: 'meeting',
    x: 150,
    y: 100
  }
}
```

#### team_log
Adds log entries to `logStore`.

```typescript
{
  type: 'team_log',
  data: {
    type: 'MISSION',
    content: 'LEO started working on task #1',
    agentId: 'leo'
  }
}
```

#### mission_complete
Updates mission status and displays completion message.

```typescript
{
  type: 'mission_complete',
  data: {
    missionId: 'mission-123',
    success: true,
    message: 'Mission completed successfully!'
  }
}
```

#### error
Displays error messages to the user.

```typescript
{
  type: 'error',
  data: {
    code: 'API_ERROR',
    message: 'Failed to connect to Claude API'
  }
}
```

### Automatic Reconnection

The hook implements automatic reconnection with the following behavior:

- **Max Attempts**: 3 reconnection attempts
- **Retry Delay**: 2 seconds between attempts
- **User Feedback**: System logs inform the user of reconnection attempts
- **Failure Handling**: After 3 failed attempts, the connection is terminated and an error is displayed

### Store Integration

The hook updates the following Zustand stores:

1. **agentStore**
   - `setAgentStatus`: Updates agent status
   - `setAgentPosition`: Updates agent x, y coordinates
   - `setAgentZone`: Updates agent zone

2. **logStore**
   - `addLog`: Adds log entries
   - `addSystemLog`: Adds system-level logs

3. **missionStore**
   - `addMission`: Creates new mission records
   - `setMissionStatus`: Updates mission status
   - `setCurrentMission`: Sets the active mission

### Error Handling

The hook handles errors at multiple levels:

1. **Connection Errors**: EventSource errors trigger reconnection logic
2. **Parse Errors**: Invalid JSON in SSE messages are logged without crashing
3. **Mission Errors**: Backend errors are displayed to the user via system logs
4. **Network Errors**: Automatic reconnection attempts with user feedback

### Best Practices

1. **Single Connection**: Only one SSE connection should be active at a time. The hook automatically disconnects existing connections before creating new ones.

2. **Cleanup**: The hook automatically cleans up the SSE connection when the component unmounts.

3. **Error Display**: Always display the `error` state to users for transparency.

4. **Loading States**: Use `isProcessing` to disable UI elements during mission execution.

5. **Mode Selection**: Provide clear UI for mode selection so users understand what type of execution they're triggering.

### Implementation Notes

- Uses `EventSource` API for SSE connections
- Implements selective subscription to Zustand stores for optimal performance
- Uses `useCallback` to memoize event handlers and prevent unnecessary re-renders
- Manages connection state with `useRef` to avoid memory leaks

### Type Safety

All SSE event types are defined in `@/lib/types/sse` for type safety:

```typescript
import type {
  SSEEvent,
  AgentStatusEvent,
  TeamLogEvent,
  MissionCompleteEvent,
  ExecutionMode,
} from '@/lib/types/sse';
```

### Future Enhancements (Phase 3)

- **agent_message**: Handle agent-to-agent communication events for chat bubbles
- **Progress Events**: Track mission progress percentage
- **Metrics Events**: Display performance metrics (tasks/sec, collaborations, etc.)
- **Custom Events**: Allow extensions to register custom event handlers
