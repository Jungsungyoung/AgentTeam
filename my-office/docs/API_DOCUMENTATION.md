# API Documentation

**Version**: Phase 2 Week 2
**Last Updated**: 2026-02-13
**Base URL**: `http://localhost:3000/api`

---

## Overview

The My Office Bridge Service API provides Server-Sent Events (SSE) streaming for real-time AI agent collaboration visualization. It supports three execution modes: Simulation, Hybrid, and Real.

---

## Endpoints

### POST /api/claude-team

Execute a mission with AI agent team collaboration.

#### Request

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```typescript
{
  mission: string;        // Mission description (required)
  mode: ExecutionMode;    // "simulation" | "hybrid" | "real" (default: "simulation")
  missionId?: string;     // Optional custom ID (auto-generated if omitted)
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/claude-team \
  -H "Content-Type: application/json" \
  -d '{
    "mission": "Create a login page with email and password fields",
    "mode": "hybrid",
    "missionId": "login-page-001"
  }'
```

#### Response

**Status**: `200 OK`

**Headers**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Body**: SSE stream with multiple events

**Example**:
```
data: {"type":"team_log","timestamp":"2026-02-13T10:00:00.000Z","data":{"type":"MISSION","content":"[MISSION START] Create a login page"}}

data: {"type":"agent_status","timestamp":"2026-02-13T10:00:00.500Z","data":{"agentId":"leo","status":"WORKING","zone":"work"}}

data: {"type":"agent_message","timestamp":"2026-02-13T10:00:01.000Z","data":{"agentId":"leo","message":"Analyzing requirements...","messageType":"internal"}}

data: {"type":"mission_complete","timestamp":"2026-02-13T10:00:05.000Z","data":{"missionId":"login-page-001","success":true,"results":{"tasksCompleted":3,"collaborations":2,"duration":5000}}}
```

#### Error Responses

**400 Bad Request**: Invalid input
```json
{
  "error": "Mission content is required"
}
```

**500 Internal Server Error**: Server error
```json
{
  "error": "Internal server error",
  "details": "Detailed error message"
}
```

---

### GET /api/claude-team

EventSource-compatible endpoint for SSE streaming.

#### Request

**Method**: `GET`

**Query Parameters**:
```
mission: string        // Mission description (required)
mode: string          // "simulation" | "hybrid" | "real" (default: "simulation")
missionId?: string    // Optional custom ID (auto-generated if omitted)
```

**Example**:
```bash
# Using curl
curl "http://localhost:3000/api/claude-team?mission=Create%20a%20dashboard&mode=hybrid"

# Using EventSource (JavaScript)
const eventSource = new EventSource(
  '/api/claude-team?mission=Create%20a%20dashboard&mode=hybrid'
);
```

#### Response

Same as POST endpoint (200 OK with SSE stream).

---

## Event Types

### BridgeEvent Interface

All SSE events follow this structure:

```typescript
interface BridgeEvent {
  type: BridgeEventType;  // Event type identifier
  timestamp: string;      // ISO 8601 timestamp
  data: object;          // Event-specific data
}

type BridgeEventType =
  | 'agent_status'
  | 'agent_message'
  | 'team_log'
  | 'mission_complete'
  | 'error';
```

---

### 1. agent_status

Agent state change (IDLE → WORKING → etc).

**Structure**:
```typescript
{
  type: 'agent_status',
  timestamp: string,
  data: {
    agentId: string;        // 'leo' | 'momo' | 'alex'
    status: AgentStatus;    // 'IDLE' | 'WORKING' | 'MOVING' | 'COMMUNICATING' | 'RESTING'
    zone: Zone;             // 'work' | 'meeting' | 'lounge'
    x?: number;             // Position X coordinate (optional)
    y?: number;             // Position Y coordinate (optional)
    stressLevel?: number;   // Stress level 0-100 (optional)
  }
}
```

**Example**:
```json
{
  "type": "agent_status",
  "timestamp": "2026-02-13T10:00:01.500Z",
  "data": {
    "agentId": "leo",
    "status": "WORKING",
    "zone": "work",
    "x": 150,
    "y": 75,
    "stressLevel": 35
  }
}
```

**Usage**: Update agent visualization (position, animation, status indicator).

---

### 2. agent_message

Agent communication/thinking/reporting.

**Structure**:
```typescript
{
  type: 'agent_message',
  timestamp: string,
  data: {
    agentId: string;                                    // Sender agent ID
    message: string;                                    // Message content
    targetAgentId?: string;                             // Target agent (optional)
    messageType: 'internal' | 'collaboration' | 'report';
  }
}
```

**Message Types**:
- `internal`: Agent's internal thought process
- `collaboration`: Message to another agent
- `report`: Status update to team

**Example**:
```json
{
  "type": "agent_message",
  "timestamp": "2026-02-13T10:00:02.000Z",
  "data": {
    "agentId": "momo",
    "message": "Planning component structure...",
    "messageType": "internal"
  }
}
```

**Usage**: Display agent chat bubbles, terminal logs.

---

### 3. team_log

Team collaboration logs (system messages).

**Structure**:
```typescript
{
  type: 'team_log',
  timestamp: string,
  data: {
    type: LogType;  // 'SYSTEM' | 'MISSION' | 'COLLAB' | 'COMPLETE' | 'AGENT'
    content: string;
    agentId?: string;  // Optional for AGENT type logs
  }
}
```

**Log Types**:
- `SYSTEM`: System-level events
- `MISSION`: Mission lifecycle events
- `COLLAB`: Collaboration events
- `COMPLETE`: Mission completion
- `AGENT`: Agent-specific logs

**Example**:
```json
{
  "type": "team_log",
  "timestamp": "2026-02-13T10:00:00.000Z",
  "data": {
    "type": "MISSION",
    "content": "[MISSION START] Create a login page with authentication"
  }
}
```

**Usage**: Display in terminal log component.

---

### 4. mission_complete

Mission completion notification.

**Structure**:
```typescript
{
  type: 'mission_complete',
  timestamp: string,
  data: {
    missionId: string;
    success: boolean;
    results: {
      tasksCompleted: number;
      collaborations: number;
      duration: number;  // milliseconds
    }
  }
}
```

**Example**:
```json
{
  "type": "mission_complete",
  "timestamp": "2026-02-13T10:00:05.000Z",
  "data": {
    "missionId": "login-page-001",
    "success": true,
    "results": {
      "tasksCompleted": 3,
      "collaborations": 2,
      "duration": 5000
    }
  }
}
```

**Usage**: Show completion notification, update mission status, reset UI.

---

### 5. error

Error notification.

**Structure**:
```typescript
{
  type: 'error',
  timestamp: string,
  data: {
    error: string;  // Error message
  }
}
```

**Example**:
```json
{
  "type": "error",
  "timestamp": "2026-02-13T10:00:01.000Z",
  "data": {
    "error": "API rate limit exceeded"
  }
}
```

**Usage**: Display error notification, halt mission execution.

---

## Event Sequence

### Typical Mission Flow

1. **Mission Start**
   ```json
   {"type": "team_log", "data": {"type": "MISSION", "content": "[MISSION START] ..."}}
   ```

2. **Agent Activation** (LEO starts working)
   ```json
   {"type": "agent_status", "data": {"agentId": "leo", "status": "WORKING", ...}}
   {"type": "agent_message", "data": {"agentId": "leo", "message": "Analyzing...", ...}}
   ```

3. **Agent Movement** (MOMO moves to meeting room)
   ```json
   {"type": "agent_status", "data": {"agentId": "momo", "status": "MOVING", ...}}
   {"type": "agent_status", "data": {"agentId": "momo", "status": "COMMUNICATING", "zone": "meeting"}}
   ```

4. **Collaboration**
   ```json
   {"type": "team_log", "data": {"type": "COLLAB", "content": "LEO & MOMO collaborating..."}}
   {"type": "agent_message", "data": {"agentId": "momo", "targetAgentId": "leo", ...}}
   ```

5. **Additional Agents** (ALEX joins)
   ```json
   {"type": "agent_status", "data": {"agentId": "alex", "status": "WORKING", ...}}
   ```

6. **Completion**
   ```json
   {"type": "agent_status", "data": {"agentId": "leo", "status": "IDLE", ...}}
   {"type": "agent_status", "data": {"agentId": "momo", "status": "IDLE", ...}}
   {"type": "agent_status", "data": {"agentId": "alex", "status": "IDLE", ...}}
   {"type": "mission_complete", "data": {"success": true, ...}}
   ```

**Total Events**: ~13 events over 4-5 seconds (Simulation/Hybrid cached)

---

## Execution Modes

### simulation

- **No API calls**: Returns predefined responses
- **Response Time**: Instant (< 100ms first event)
- **Cost**: Free
- **Cache**: N/A
- **Use Case**: UI development, offline work

### hybrid

- **Cache first**: Check cache before API call
- **Cache HIT**: Instant playback with recalculated timestamps
- **Cache MISS**: Call Claude API, then cache response
- **Response Time**: 0ms (cached) or 2-5s (API)
- **Cost**: Low (only new missions)
- **Use Case**: Feature development, repeated tests

### real

- **Always call API**: No caching
- **Response Time**: 2-5s (every mission)
- **Cost**: High
- **Cache**: Disabled
- **Use Case**: Final testing, production-like behavior

---

## Rate Limiting

### Current Implementation (Phase 2)

No rate limiting on API routes. Anthropic API has its own rate limits:

- **Requests**: Varies by plan (typically 1000/day for free tier)
- **Tokens**: Varies by plan (typically 100k/day for free tier)

### Recommendations

1. **Development**: Use Hybrid mode to minimize API calls
2. **Testing**: Monitor `cost-tracking.json` for usage
3. **Production**: Implement custom rate limiting in Phase 3

---

## Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | `Mission content is required` | Empty mission string |
| 400 | `Invalid mode` | Mode not in [simulation, hybrid, real] |
| 500 | `Internal server error` | Unexpected server error |
| 503 | `Claude API unavailable` | Anthropic API down or rate limited |

---

## Client Implementation Examples

### JavaScript (EventSource)

```javascript
const mission = 'Create a login page';
const mode = 'hybrid';
const missionId = crypto.randomUUID();

const url = `/api/claude-team?mission=${encodeURIComponent(mission)}&mode=${mode}&missionId=${missionId}`;
const eventSource = new EventSource(url);

// Handle events
eventSource.addEventListener('message', (event) => {
  const bridgeEvent = JSON.parse(event.data);

  switch (bridgeEvent.type) {
    case 'agent_status':
      updateAgentUI(bridgeEvent.data);
      break;
    case 'agent_message':
      displayMessage(bridgeEvent.data);
      break;
    case 'team_log':
      addLogEntry(bridgeEvent.data);
      break;
    case 'mission_complete':
      onMissionComplete(bridgeEvent.data);
      eventSource.close();
      break;
    case 'error':
      handleError(bridgeEvent.data);
      eventSource.close();
      break;
  }
});

// Handle errors
eventSource.addEventListener('error', (error) => {
  console.error('SSE connection error:', error);
  eventSource.close();
});
```

### React Hook (useClaudeTeam)

```typescript
import { useClaudeTeam } from '@/lib/hooks/useClaudeTeam';

function MyComponent() {
  const { executeMission, isExecuting, error } = useClaudeTeam();

  const handleSubmit = async () => {
    await executeMission('Create a dashboard', 'hybrid');
  };

  return (
    <button onClick={handleSubmit} disabled={isExecuting}>
      {isExecuting ? 'Executing...' : 'Execute Mission'}
    </button>
  );
}
```

### TypeScript (fetch with manual SSE parsing)

```typescript
const response = await fetch('/api/claude-team', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mission: 'Create a login page',
    mode: 'hybrid'
  })
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));
      handleEvent(event);
    }
  }
}
```

---

## Testing

### Manual Testing

```bash
# Test Simulation mode
curl "http://localhost:3000/api/claude-team?mission=Test&mode=simulation"

# Test Hybrid mode (requires API key)
curl -X POST http://localhost:3000/api/claude-team \
  -H "Content-Type: application/json" \
  -d '{"mission":"Test","mode":"hybrid"}'
```

### Automated Testing

```typescript
// Example using Vitest
import { describe, it, expect } from 'vitest';

describe('Bridge Service API', () => {
  it('should return SSE stream for simulation mode', async () => {
    const response = await fetch('/api/claude-team?mission=Test&mode=simulation');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('should reject empty mission', async () => {
    const response = await fetch('/api/claude-team?mission=&mode=simulation');
    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error).toBe('Mission content is required');
  });
});
```

---

## Caching Behavior (Hybrid Mode)

### Cache Key Generation

```typescript
// Normalized mission text → hash
"Create a Dashboard"
  → "create a dashboard"  // lowercase
  → "create-a-dashboard"   // normalize whitespace
  → hash → "8a3f2d1e..."   // cache key
```

### Cache Storage

```typescript
{
  key: "8a3f2d1e...",
  value: [
    { type: 'team_log', timestamp: '2026-02-13T10:00:00Z', data: {...} },
    { type: 'agent_status', timestamp: '2026-02-13T10:00:01Z', data: {...} },
    // ... all events
  ],
  expiresAt: 1707907200000  // 24 hours from creation
}
```

### Playback Algorithm

When cache hit:
1. Retrieve cached event array
2. Calculate original time intervals
3. Recalculate timestamps (start from current time)
4. Stream events with same intervals
5. Maintain original timing for smooth animation

**Example**:
```
Original:
  Event 1: T+0ms
  Event 2: T+500ms
  Event 3: T+1500ms

Playback:
  Event 1: Now
  Event 2: Now+500ms
  Event 3: Now+1500ms
```

---

## Monitoring & Analytics

### Cost Tracking

All API calls are automatically tracked in `cost-tracking.json`:

```json
{
  "lastUpdated": "2026-02-13T10:30:00.000Z",
  "sessionStats": {
    "totalCalls": 42,
    "cachedCalls": 28,
    "apiCalls": 14,
    "estimatedTokens": 15000,
    "cacheHitRate": "66.67"
  },
  "dailyStats": {
    "date": "2026-02-13",
    "totalCalls": 42,
    "cachedCalls": 28,
    "apiCalls": 14,
    "estimatedTokens": 15000,
    "modes": {
      "sim": 10,
      "hybrid": 25,
      "real": 7
    }
  },
  "recentCalls": [
    {
      "timestamp": 1707821400000,
      "endpoint": "/api/claude-team",
      "tokensEstimate": 350,
      "mode": "hybrid",
      "cached": false
    }
  ]
}
```

### Cache Statistics

```typescript
import { missionCache } from '@/lib/cache';

const stats = missionCache.getStats();
// {
//   size: 42,
//   validEntries: 40,
//   totalHits: 120,
//   maxSize: 100,
//   ttl: 86400000
// }
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-13 | Initial API documentation for Phase 2 Week 2 |

---

## Related Documentation

- [HYBRID_MODE_GUIDE.md](./HYBRID_MODE_GUIDE.md) - User guide for Hybrid mode
- [development-modes.md](./development-modes.md) - Mode comparison and setup
- [INTEGRATION_QUICK_START.md](./INTEGRATION_QUICK_START.md) - Quick integration guide
- [WEEK1_INTEGRATION_TEST_REPORT.md](../WEEK1_INTEGRATION_TEST_REPORT.md) - Test results

---

**Maintained by**: Documentation Team
**Last Updated**: 2026-02-13
**API Version**: Phase 2 Week 2
