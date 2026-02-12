import { NextRequest } from 'next/server';
import { missionCache } from '@/lib/cache/mission-cache';
import { costTracker, CostTracker } from '@/lib/monitoring/cost-tracker';

/**
 * Bridge Service - Phase 2 Architecture
 *
 * Purpose: Connects user missions with Claude Code Agent Team via SSE streaming
 *
 * Architecture Overview:
 * - POST endpoint receives mission + mode (simulation/hybrid/real)
 * - Returns SSE stream for real-time agent updates
 * - Week 1: Simulation mode with dummy responses
 * - Week 2: Hybrid mode with caching (IMPLEMENTED)
 * - Week 3: Real mode with Claude Agent Team integration (TODO)
 */

// Event types for SSE streaming
export type BridgeEventType =
  | 'agent_status'      // Agent state change (IDLE → WORKING → etc)
  | 'agent_message'     // Agent communication/thinking
  | 'team_log'          // Team collaboration logs
  | 'mission_complete'  // Mission completion
  | 'error';            // Error events

export interface BridgeEvent {
  type: BridgeEventType;
  timestamp: string;
  data: {
    // Agent status fields
    agentId?: string;
    status?: string;
    zone?: string;
    x?: number;
    y?: number;
    stressLevel?: number;

    // Agent message fields
    message?: string;
    targetAgentId?: string;
    messageType?: 'internal' | 'collaboration' | 'report';

    // Team log fields (TeamLogEvent structure)
    type?: string; // LogType: 'SYSTEM' | 'MISSION' | 'COLLAB' | 'COMPLETE' | 'AGENT'
    content?: string;

    // Mission complete fields
    missionId?: string;
    success?: boolean;
    results?: {
      tasksCompleted: number;
      collaborations: number;
      duration: number;
    };

    // Error fields
    error?: string;
  };
}

// Mission execution modes
export type ExecutionMode = 'simulation' | 'hybrid' | 'real';

interface MissionRequest {
  mission: string;
  mode: ExecutionMode;
  missionId?: string;
}

/**
 * Shared function to create SSE stream
 * Used by both GET and POST endpoints
 */
function createSSEStream(
  mission: string,
  mode: ExecutionMode,
  missionId: string
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE events
      const sendEvent = (event: BridgeEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        // Route to appropriate handler based on mode
        switch (mode) {
          case 'simulation':
            await handleSimulationMode(mission, missionId, sendEvent);
            break;
          case 'hybrid':
            // TODO: Week 2 - Implement hybrid mode with caching
            await handleHybridMode(mission, missionId, sendEvent);
            break;
          case 'real':
            // TODO: Week 3 - Implement real Claude Agent Team integration
            await handleRealMode(mission, missionId, sendEvent);
            break;
        }

        controller.close();
      } catch (error) {
        // Send error event
        sendEvent({
          type: 'error',
          timestamp: new Date().toISOString(),
          data: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          },
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * GET /api/claude-team?mission=xxx&mode=simulation
 *
 * EventSource-compatible endpoint (SSE standard requires GET)
 * Query params:
 * - mission: Mission content (required)
 * - mode: simulation | hybrid | real (default: simulation)
 * - missionId: Optional mission ID
 *
 * Response: SSE stream with BridgeEvent objects
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mission = searchParams.get('mission') || '';
    const mode = (searchParams.get('mode') || 'simulation') as ExecutionMode;
    const missionId = searchParams.get('missionId') || crypto.randomUUID();

    // Validation
    if (!mission || mission.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Mission content is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!['simulation', 'hybrid', 'real'].includes(mode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid mode. Must be simulation, hybrid, or real' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create and return SSE stream
    return createSSEStream(mission, mode, missionId);
  } catch (error) {
    console.error('Bridge Service error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /api/claude-team
 *
 * Request body:
 * {
 *   "mission": "Create a login page with authentication",
 *   "mode": "simulation" | "hybrid" | "real",
 *   "missionId": "optional-uuid"
 * }
 *
 * Response: SSE stream with BridgeEvent objects
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MissionRequest;
    const { mission, mode = 'simulation', missionId } = body;

    // Validation
    if (!mission || typeof mission !== 'string' || mission.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Mission content is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!['simulation', 'hybrid', 'real'].includes(mode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid mode. Must be simulation, hybrid, or real' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create and return SSE stream
    return createSSEStream(mission, mode, missionId || crypto.randomUUID());
  } catch (error) {
    console.error('Bridge Service error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Playback Cached Session
 *
 * Replays previously cached events with recalculated timestamps
 * Simulates real-time streaming by maintaining original timing intervals
 */
async function playbackCachedSession(
  cachedEvents: BridgeEvent[],
  sendEvent: (event: BridgeEvent) => void
) {
  if (cachedEvents.length === 0) {
    return;
  }

  // Calculate time deltas between original events
  const originalTimestamps = cachedEvents.map((e) => new Date(e.timestamp).getTime());
  const deltas: number[] = [];
  for (let i = 1; i < originalTimestamps.length; i++) {
    deltas.push(originalTimestamps[i] - originalTimestamps[i - 1]);
  }

  // Replay first event immediately with new timestamp
  const now = Date.now();
  sendEvent({
    ...cachedEvents[0],
    timestamp: new Date(now).toISOString(),
  });

  // Replay remaining events with original timing intervals
  for (let i = 1; i < cachedEvents.length; i++) {
    await sleep(deltas[i - 1]);
    sendEvent({
      ...cachedEvents[i],
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Simulation Mode - Week 1 Implementation
 *
 * Generates dummy agent responses with realistic timing
 * No external API calls, purely local simulation
 */
async function handleSimulationMode(
  mission: string,
  missionId: string,
  sendEvent: (event: BridgeEvent) => void
) {
  // Simulate mission start
  sendEvent({
    type: 'team_log',
    timestamp: new Date().toISOString(),
    data: {
      type: 'MISSION',
      content: `[MISSION START] ${mission}`,
    },
  });

  await sleep(500);

  // LEO analyzes the mission
  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'leo',
      status: 'WORKING',
      zone: 'work',
    },
  });

  sendEvent({
    type: 'agent_message',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'leo',
      message: 'Analyzing mission requirements...',
    },
  });

  await sleep(800);

  // MOMO joins for planning
  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'momo',
      status: 'MOVING',
      zone: 'meeting',
    },
  });

  await sleep(400);

  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'momo',
      status: 'COMMUNICATING',
      zone: 'meeting',
    },
  });

  sendEvent({
    type: 'agent_message',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'momo',
      message: 'Breaking down tasks and creating plan...',
    },
  });

  await sleep(1000);

  // ALEX verifies approach
  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'alex',
      status: 'WORKING',
      zone: 'work',
    },
  });

  sendEvent({
    type: 'agent_message',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'alex',
      message: 'Reviewing technical feasibility...',
    },
  });

  await sleep(800);

  // Team collaboration log
  sendEvent({
    type: 'team_log',
    timestamp: new Date().toISOString(),
    data: {
      type: 'COLLAB',
      content: '[COLLABORATION] Team discussing implementation strategy',
    },
  });

  await sleep(1200);

  // Mission completion
  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'leo',
      status: 'IDLE',
    },
  });

  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'momo',
      status: 'IDLE',
    },
  });

  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'alex',
      status: 'IDLE',
    },
  });

  sendEvent({
    type: 'mission_complete',
    timestamp: new Date().toISOString(),
    data: {
      missionId,
      success: true,
      message: '[SIMULATION] Mission analyzed successfully. Ready for real implementation in Week 3.',
    },
  });
}

/**
 * Hybrid Mode - Week 2 Implementation
 *
 * Checks cache for similar missions, falls back to simulation if cache miss
 * Implements cost optimization through intelligent caching
 */
async function handleHybridMode(
  mission: string,
  missionId: string,
  sendEvent: (event: BridgeEvent) => void
) {
  // Step 1: Generate cache key from mission
  const cacheKey = missionCache.getCacheKey(mission);

  // Step 2: Check cache for existing session
  const cachedSession = missionCache.get(mission);

  if (cachedSession) {
    // Cache hit - replay cached session
    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: '[HYBRID MODE] Cache hit - replaying cached session',
      },
    });

    // Track as cached call
    await costTracker.trackCall(
      '/api/claude-team',
      CostTracker.estimateTokens(mission),
      'hybrid',
      true
    );

    // Playback cached events
    await playbackCachedSession(cachedSession as BridgeEvent[], sendEvent);
  } else {
    // Cache miss - execute simulation and cache result
    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: '[HYBRID MODE] Cache miss - executing mission and caching result',
      },
    });

    // Track as API call (even though it's simulation mode for now)
    await costTracker.trackCall(
      '/api/claude-team',
      CostTracker.estimateTokens(mission),
      'hybrid',
      false
    );

    // Capture events for caching
    const capturedEvents: BridgeEvent[] = [];
    const capturingSendEvent = (event: BridgeEvent) => {
      capturedEvents.push(event);
      sendEvent(event);
    };

    // Execute simulation mode
    await handleSimulationMode(mission, missionId, capturingSendEvent);

    // Cache the captured events
    missionCache.set(mission, capturedEvents);

    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: '[HYBRID MODE] Session cached successfully',
      },
    });
  }
}

/**
 * Real Mode - Week 2 Implementation
 *
 * Full integration with Claude Code Agent Team
 * Real-time streaming of actual agent collaboration
 */
async function handleRealMode(
  mission: string,
  missionId: string,
  sendEvent: (event: BridgeEvent) => void
) {
  // Dynamic import to avoid circular dependency and enable tree-shaking
  const { ClaudeCodeWrapper } = await import('@/lib/claude-code/wrapper');

  const wrapper = new ClaudeCodeWrapper({
    cliPath: 'claude-code',
    workingDirectory: process.cwd(),
    timeout: 300000, // 5 minutes
  });

  const teamName = `team-${missionId.slice(0, 8)}`;

  try {
    // Step 1: Initialize team
    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: '[REAL MODE] Initializing agent team...',
      },
    });

    // Step 2: Create agent team with LEO, MOMO, ALEX
    const createResult = await wrapper.createTeam({
      teamName,
      agents: ['leo', 'momo', 'alex'],
      maxAgents: 3,
    });

    if (!createResult.success) {
      throw new Error(`Failed to create team: ${createResult.error}`);
    }

    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: '[REAL MODE] Team created successfully',
      },
    });

    // Step 3: Set up event listeners for real-time streaming
    wrapper.on('teamEvent', (event: any) => {
      // Map Claude Code events to Bridge events
      const bridgeEvent = mapCLIEventToBridgeEvent(event, missionId);
      if (bridgeEvent) {
        sendEvent(bridgeEvent);
      }
    });

    // Step 4: Start monitoring team output
    await wrapper.monitorTeam(teamName);

    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: '[REAL MODE] Monitoring team activity...',
      },
    });

    // Step 5: Analyze mission and create tasks
    await analyzeMissionAndCreateTasks(wrapper, teamName, mission, sendEvent);

    // Step 6: Wait for completion or timeout
    await waitForCompletion(wrapper, teamName, sendEvent, missionId);

    // Step 7: Mission complete
    sendEvent({
      type: 'mission_complete',
      timestamp: new Date().toISOString(),
      data: {
        missionId,
        success: true,
        message: '[REAL MODE] Mission completed successfully',
      },
    });

    // Step 8: Cleanup
    await wrapper.shutdownTeam(teamName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    sendEvent({
      type: 'error',
      timestamp: new Date().toISOString(),
      data: {
        error: `[REAL MODE] Error: ${errorMessage}`,
        missionId,
      },
    });

    // Cleanup on error
    try {
      await wrapper.shutdownTeam(teamName);
    } catch {
      // Ignore cleanup errors
    }

    throw error;
  }
}

/**
 * Analyze mission and distribute tasks to agents
 */
async function analyzeMissionAndCreateTasks(
  wrapper: any,
  teamName: string,
  mission: string,
  sendEvent: (event: BridgeEvent) => void
) {
  // Task 1: LEO analyzes technical requirements
  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'leo',
      status: 'WORKING',
      zone: 'work',
    },
  });

  await wrapper.createTask({
    teamName,
    subject: 'Analyze technical requirements',
    description: `Review the mission and identify technical requirements:\n${mission}`,
    activeForm: 'Analyzing requirements',
  });

  await sleep(1000);

  // Task 2: MOMO creates implementation plan
  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'momo',
      status: 'WORKING',
      zone: 'work',
    },
  });

  await wrapper.createTask({
    teamName,
    subject: 'Create implementation plan',
    description: 'Break down the mission into actionable steps and create a roadmap',
    activeForm: 'Planning implementation',
  });

  await sleep(1000);

  // Task 3: ALEX validates approach
  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'alex',
      status: 'WORKING',
      zone: 'work',
    },
  });

  await wrapper.createTask({
    teamName,
    subject: 'Validate technical approach',
    description: 'Review the plan and ensure it meets best practices and requirements',
    activeForm: 'Validating approach',
  });
}

/**
 * Wait for all tasks to complete
 */
async function waitForCompletion(
  wrapper: any,
  teamName: string,
  sendEvent: (event: BridgeEvent) => void,
  missionId: string,
  timeoutMs: number = 120000 // 2 minutes default
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      // Check timeout
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        sendEvent({
          type: 'team_log',
          timestamp: new Date().toISOString(),
          data: {
            type: 'SYSTEM',
            content: '[REAL MODE] Timeout reached, completing mission',
          },
        });
        resolve();
        return;
      }

      // Check team status
      const teamStatus = wrapper.getTeamStatus(teamName);
      if (!teamStatus || teamStatus.status === 'stopped' || teamStatus.status === 'error') {
        clearInterval(checkInterval);
        resolve();
      }
    }, 500); // Check every 500ms

    // Auto-resolve after timeout
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, timeoutMs);
  });
}

/**
 * Map Claude Code CLI events to Bridge events
 */
function mapCLIEventToBridgeEvent(
  cliEvent: any,
  missionId: string
): BridgeEvent | null {
  const { type, data } = cliEvent;

  switch (type) {
    case 'AGENT_MESSAGE':
      return {
        type: 'agent_message',
        timestamp: new Date().toISOString(),
        data: {
          agentId: data.agentId,
          message: data.message,
        },
      };

    case 'AGENT_STATUS':
      return {
        type: 'agent_status',
        timestamp: new Date().toISOString(),
        data: {
          agentId: data.agentId,
          status: data.status.toUpperCase(),
        },
      };

    case 'TASK_UPDATED':
      return {
        type: 'team_log',
        timestamp: new Date().toISOString(),
        data: {
          type: 'SYSTEM',
          content: `[TASK UPDATE] Task ${data.taskId}: ${data.status}`,
        },
      };

    case 'TASK_CREATED':
      return {
        type: 'team_log',
        timestamp: new Date().toISOString(),
        data: {
          type: 'SYSTEM',
          content: `[TASK CREATED] ${data.subject}`,
        },
      };

    case 'TEAM_ERROR':
      return {
        type: 'error',
        timestamp: new Date().toISOString(),
        data: {
          error: data.error || 'Unknown team error',
          missionId,
        },
      };

    case 'STDOUT':
    case 'STDERR':
      // Optionally log raw output
      return {
        type: 'team_log',
        timestamp: new Date().toISOString(),
        data: {
          type: 'SYSTEM',
          content: `[${type}] ${data.message || data.output || ''}`,
        },
      };

    default:
      // Unknown event type
      return null;
  }
}

/**
 * Utility function for simulating delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
