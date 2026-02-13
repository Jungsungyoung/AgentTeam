import { NextRequest } from 'next/server';
import { missionCache } from '@/lib/cache/mission-cache';
import { costTracker, CostTracker } from '@/lib/monitoring/cost-tracker';
import { getClaudeClient, ClaudeAPIError } from '@/lib/api';
import { getAgentPersona } from '@/lib/personas/agent-personas';
import { loadAgentSkills, createSystemPromptWithSkills } from '@/lib/personas/agent-skills';
import type { AgentId } from '@/lib/types/agent';
import type {
  AgentCollaborationEvent,
  TaskProgressEvent,
  MissionDeliverableEvent,
  UserPromptRequiredEvent,
  ChatMessageEvent
} from '@/lib/types/sse';

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
  | 'agent_status'           // Agent state change (IDLE → WORKING → etc)
  | 'agent_message'          // Agent communication/thinking
  | 'team_log'               // Team collaboration logs
  | 'mission_complete'       // Mission completion
  | 'error'                  // Error events
  | 'agent_collaboration'    // Agent-to-agent conversation
  | 'task_progress'          // Task execution progress
  | 'mission_deliverable'    // Mission output/artifact
  | 'user_prompt_required'   // Agent needs user input
  | 'chat_message';          // Bidirectional user-agent chat

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
 * Replays previously cached events instantly with updated timestamps
 * Cache hits should be near-instant (<100ms) for optimal performance
 */
async function playbackCachedSession(
  cachedEvents: BridgeEvent[],
  sendEvent: (event: BridgeEvent) => void
) {
  if (cachedEvents.length === 0) {
    return;
  }

  // Stream all cached events immediately with minimal delay
  // Small 10ms delay between events for SSE client processing
  const now = Date.now();

  for (let i = 0; i < cachedEvents.length; i++) {
    sendEvent({
      ...cachedEvents[i],
      timestamp: new Date(now + i * 10).toISOString(),
    });

    // Minimal delay to prevent overwhelming the client
    if (i < cachedEvents.length - 1) {
      await sleep(10);
    }
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
    // Cache miss - call Claude API and cache result
    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: '[HYBRID MODE] Cache miss - calling Claude API',
      },
    });

    // Capture events for caching
    const capturedEvents: BridgeEvent[] = [];
    const capturingSendEvent = (event: BridgeEvent) => {
      capturedEvents.push(event);
      sendEvent(event);
    };

    try {
      // Call Claude API to analyze mission
      await executeClaudeAPIMode(mission, missionId, capturingSendEvent);

      // Track as API call
      await costTracker.trackCall(
        '/api/claude-team',
        CostTracker.estimateTokens(mission),
        'hybrid',
        false
      );

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
    } catch (error) {
      // If API call fails, fall back to simulation
      console.error('Claude API error, falling back to simulation:', error);

      sendEvent({
        type: 'team_log',
        timestamp: new Date().toISOString(),
        data: {
          type: 'SYSTEM',
          content: '[HYBRID MODE] API error - falling back to simulation',
        },
      });

      // Execute simulation mode as fallback
      await handleSimulationMode(mission, missionId, capturingSendEvent);

      // Track as API call (attempted)
      await costTracker.trackCall(
        '/api/claude-team',
        CostTracker.estimateTokens(mission),
        'hybrid',
        false
      );

      // Cache the simulation result
      missionCache.set(mission, capturedEvents);
    }
  }
}

/**
 * Execute Claude API Mode
 * Calls Claude API to analyze mission and simulate agent collaboration
 */
async function executeClaudeAPIMode(
  mission: string,
  missionId: string,
  sendEvent: (event: BridgeEvent) => void
) {
  const claudeClient = getClaudeClient();

  // Check if API key is configured
  if (!claudeClient.isInitialized()) {
    throw new ClaudeAPIError(
      'ANTHROPIC_API_KEY not configured. Please set it in .env.local',
      401,
      false
    );
  }

  // Send mission start event
  sendEvent({
    type: 'team_log',
    timestamp: new Date().toISOString(),
    data: {
      type: 'MISSION',
      content: `[MISSION START] ${mission}`,
    },
  });

  await sleep(300);

  // Call Claude API to analyze mission
  sendEvent({
    type: 'team_log',
    timestamp: new Date().toISOString(),
    data: {
      type: 'SYSTEM',
      content: '[CLAUDE API] Analyzing mission...',
    },
  });

  const analysis = await claudeClient.analyzeMission(mission);

  await sleep(500);

  // LEO starts working
  sendEvent({
    type: 'agent_status',
    timestamp: new Date().toISOString(),
    data: {
      agentId: 'leo',
      status: 'WORKING',
      zone: 'work',
    },
  });

  if (analysis.agents.leo) {
    sendEvent({
      type: 'agent_message',
      timestamp: new Date().toISOString(),
      data: {
        agentId: 'leo',
        message: analysis.agents.leo,
      },
    });
  }

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

  if (analysis.agents.momo) {
    sendEvent({
      type: 'agent_message',
      timestamp: new Date().toISOString(),
      data: {
        agentId: 'momo',
        message: analysis.agents.momo,
      },
    });
  }

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

  if (analysis.agents.alex) {
    sendEvent({
      type: 'agent_message',
      timestamp: new Date().toISOString(),
      data: {
        agentId: 'alex',
        message: analysis.agents.alex,
      },
    });
  }

  await sleep(800);

  // Show analysis result
  sendEvent({
    type: 'team_log',
    timestamp: new Date().toISOString(),
    data: {
      type: 'COLLAB',
      content: `[ANALYSIS] ${analysis.analysis}`,
    },
  });

  await sleep(1200);

  // All agents return to idle
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

  // Mission complete
  sendEvent({
    type: 'mission_complete',
    timestamp: new Date().toISOString(),
    data: {
      missionId,
      success: true,
      message: `[HYBRID MODE] Mission analyzed by Claude AI. ${analysis.tasks.length} tasks identified.`,
    },
  });
}

/**
 * Create team with personas and skills loaded
 * Phase 2 Enhancement: Each agent gets personalized system prompt with skills
 */
async function createTeamWithPersonasAndSkills(
  wrapper: any,
  teamName: string,
  sendEvent: (event: BridgeEvent) => void
): Promise<void> {
  sendEvent({
    type: 'team_log',
    timestamp: new Date().toISOString(),
    data: {
      type: 'SYSTEM',
      content: '[REAL MODE] Loading agent personas and skills...',
    },
  });

  // Load skills for all agents in parallel
  const agentIds: AgentId[] = ['leo', 'momo', 'alex'];
  const skillsPromises = agentIds.map(agentId => loadAgentSkills(agentId));
  const allSkills = await Promise.all(skillsPromises);

  // Create agents with enhanced system prompts
  const agentConfigs = agentIds.map((agentId, index) => {
    const persona = getAgentPersona(agentId);
    const skills = allSkills[index];
    const systemPrompt = createSystemPromptWithSkills(persona.systemPrompt, skills);

    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: `[${persona.name}] Loaded ${skills.length} skill documents`,
      },
    });

    return {
      name: agentId,
      systemPrompt,
    };
  });

  // Create team with persona-enhanced agents
  const createResult = await wrapper.createTeam({
    teamName,
    agents: agentConfigs,
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
      content: '[REAL MODE] Team created with personas and skills',
    },
  });
}

/**
 * Parse deliverable from agent message
 * Format: [DELIVERABLE:type:title]content[/DELIVERABLE]
 */
function parseDeliverable(
  message: string,
  agentId: AgentId,
  missionId: string
): MissionDeliverableEvent | null {
  const regex = /\[DELIVERABLE:(\w+):([^\]]+)\]([\s\S]*?)\[\/DELIVERABLE\]/;
  const match = message.match(regex);

  if (!match) {
    return null;
  }

  const [, type, title, content] = match;
  const validTypes = ['code', 'document', 'analysis', 'plan'];

  if (!validTypes.includes(type)) {
    console.warn(`Invalid deliverable type: ${type}`);
    return null;
  }

  return {
    deliverableId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    missionId,
    agentId,
    type: type as 'code' | 'document' | 'analysis' | 'plan',
    title: title.trim(),
    content: content.trim(),
    metadata: {
      language: type === 'code' ? detectLanguage(content) : undefined,
      format: type === 'document' ? 'markdown' : undefined,
    },
  };
}

/**
 * Detect programming language from code content
 */
function detectLanguage(code: string): string {
  if (code.includes('export') || code.includes('import')) return 'typescript';
  if (code.includes('function') || code.includes('const')) return 'javascript';
  if (code.includes('def ') || code.includes('import ')) return 'python';
  return 'text';
}

/**
 * Detect agent-to-agent collaboration from message
 * Looks for messages directed at other agents
 */
function detectCollaboration(
  message: string,
  fromAgentId: AgentId
): AgentCollaborationEvent | null {
  const agentNames = ['LEO', 'MOMO', 'ALEX'];
  const agentIds: AgentId[] = ['leo', 'momo', 'alex'];

  // Check if message mentions another agent
  for (let i = 0; i < agentNames.length; i++) {
    const name = agentNames[i];
    const id = agentIds[i];

    if (id === fromAgentId) continue;

    // Look for patterns like "@LEO", "LEO,", or "Hey LEO"
    const mentionPattern = new RegExp(`(@${name}|${name}[,:]|Hey ${name}|${name} -)`);
    if (mentionPattern.test(message)) {
      // Determine collaboration type
      let collaborationType: AgentCollaborationEvent['collaborationType'] = 'question';
      if (message.includes('?')) collaborationType = 'question';
      else if (message.includes('approve') || message.includes('agree')) collaborationType = 'approval';
      else if (message.includes('propose') || message.includes('suggest')) collaborationType = 'proposal';
      else if (message.includes('handoff') || message.includes('your turn')) collaborationType = 'handoff';
      else collaborationType = 'answer';

      return {
        fromAgentId,
        toAgentId: id,
        message: message.trim(),
        collaborationType,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return null;
}

/**
 * Check if message contains user prompt request
 * Format: [USER_PROMPT]question[/USER_PROMPT]
 */
function parseUserPromptRequest(
  message: string,
  agentId: AgentId
): UserPromptRequiredEvent | null {
  const regex = /\[USER_PROMPT\]([\s\S]*?)\[\/USER_PROMPT\]/;
  const match = message.match(regex);

  if (!match) {
    return null;
  }

  const question = match[1].trim();

  return {
    agentId,
    question,
    requiresResponse: true,
  };
}

/**
 * Setup enhanced event listeners for Real Mode
 * Parses new event types: deliverables, collaboration, user prompts
 */
function setupEnhancedEventListeners(
  wrapper: any,
  missionId: string,
  sendEvent: (event: BridgeEvent) => void
) {
  wrapper.on('teamEvent', (event: any) => {
    // First map standard events
    const bridgeEvent = mapCLIEventToBridgeEvent(event, missionId);
    if (bridgeEvent) {
      sendEvent(bridgeEvent);
    }

    // Enhanced parsing for agent messages
    if (event.type === 'AGENT_MESSAGE' && event.data?.message) {
      const { agentId, message } = event.data;

      // 1. Check for deliverables
      const deliverable = parseDeliverable(message, agentId, missionId);
      if (deliverable) {
        sendEvent({
          type: 'mission_deliverable',
          timestamp: new Date().toISOString(),
          data: deliverable,
        });
      }

      // 2. Check for agent collaboration
      const collaboration = detectCollaboration(message, agentId);
      if (collaboration) {
        sendEvent({
          type: 'agent_collaboration',
          timestamp: new Date().toISOString(),
          data: collaboration,
        });
      }

      // 3. Check for user prompt requests
      const userPrompt = parseUserPromptRequest(message, agentId);
      if (userPrompt) {
        sendEvent({
          type: 'user_prompt_required',
          timestamp: new Date().toISOString(),
          data: userPrompt,
        });
      }
    }

    // Enhanced parsing for task updates
    if (event.type === 'TASK_UPDATED' && event.data) {
      const taskProgress: TaskProgressEvent = {
        taskId: event.data.taskId || 'unknown',
        taskName: event.data.subject || 'Unnamed task',
        agentId: event.data.owner || 'leo',
        progress: event.data.status === 'completed' ? 100 : event.data.status === 'in_progress' ? 50 : 0,
        status: event.data.status || 'started',
        message: event.data.description,
      };

      sendEvent({
        type: 'task_progress',
        timestamp: new Date().toISOString(),
        data: taskProgress,
      });
    }
  });
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
  try {
    // Step 1: Start mission
    sendEvent({
      type: 'team_log',
      timestamp: new Date().toISOString(),
      data: {
        type: 'SYSTEM',
        content: '[REAL MODE] Starting Claude Agent Team...',
      },
    });

    sendEvent({
      type: 'agent_status',
      timestamp: new Date().toISOString(),
      data: {
        agentId: 'boss',
        status: 'MANAGING',
      },
    });

    // Step 2: Execute Claude with mission
    // User's Claude config already has Agent Team enabled
    const { spawn } = await import('child_process');

    const claudeProcess = spawn('claude', ['-p', mission], {
      cwd: process.cwd(),
      shell: true,
    });

    let output = '';
    let currentAgent: AgentId = 'leo';

    // Step 3: Stream output in real-time
    claudeProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;

      // Detect agent activity from output
      if (text.includes('LEO') || text.includes('leo')) {
        currentAgent = 'leo';
        sendEvent({
          type: 'agent_status',
          timestamp: new Date().toISOString(),
          data: { agentId: 'leo', status: 'WORKING' },
        });
      } else if (text.includes('MOMO') || text.includes('momo')) {
        currentAgent = 'momo';
        sendEvent({
          type: 'agent_status',
          timestamp: new Date().toISOString(),
          data: { agentId: 'momo', status: 'WORKING' },
        });
      } else if (text.includes('ALEX') || text.includes('alex')) {
        currentAgent = 'alex';
        sendEvent({
          type: 'agent_status',
          timestamp: new Date().toISOString(),
          data: { agentId: 'alex', status: 'WORKING' },
        });
      }

      // Send agent message
      sendEvent({
        type: 'agent_message',
        timestamp: new Date().toISOString(),
        data: {
          agentId: currentAgent,
          message: text,
          messageType: 'report',
        },
      });

      // Send to terminal log
      sendEvent({
        type: 'team_log',
        timestamp: new Date().toISOString(),
        data: {
          type: 'AGENT',
          content: text,
          agentId: currentAgent,
        },
      });
    });

    claudeProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      sendEvent({
        type: 'team_log',
        timestamp: new Date().toISOString(),
        data: {
          type: 'SYSTEM',
          content: `[ERROR] ${error}`,
        },
      });
    });

    // Step 4: Wait for completion
    await new Promise<void>((resolve, reject) => {
      claudeProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Claude process exited with code ${code}`));
        }
      });

      claudeProcess.on('error', (err) => {
        reject(err);
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        claudeProcess.kill();
        reject(new Error('Claude process timeout'));
      }, 300000);
    });

    // Step 5: Mission complete
    sendEvent({
      type: 'agent_status',
      timestamp: new Date().toISOString(),
      data: { agentId: 'boss', status: 'IDLE' },
    });

    sendEvent({
      type: 'mission_complete',
      timestamp: new Date().toISOString(),
      data: {
        missionId,
        success: true,
        message: '[REAL MODE] Mission completed successfully',
      },
    });
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
  } finally {
    // Reset agent states
    sendEvent({
      type: 'agent_status',
      timestamp: new Date().toISOString(),
      data: { agentId: 'leo', status: 'IDLE' },
    });
    sendEvent({
      type: 'agent_status',
      timestamp: new Date().toISOString(),
      data: { agentId: 'momo', status: 'IDLE' },
    });
    sendEvent({
      type: 'agent_status',
      timestamp: new Date().toISOString(),
      data: { agentId: 'alex', status: 'IDLE' },
    });
  }
}

/**
 * Analyze mission and distribute tasks to agents
 * PHASE 2 ENHANCEMENT: Assigns persona-appropriate tasks with skill document references
 */
async function analyzeMissionAndCreateTasks(
  wrapper: any,
  teamName: string,
  mission: string,
  sendEvent: (event: BridgeEvent) => void
) {
  // Task 1: LEO analyzes technical requirements (REFERENCES: React Best Practices, TypeScript Patterns)
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
    subject: 'Analyze technical requirements and design implementation',
    description: `Review the mission and identify technical requirements. Reference your React Best Practices and TypeScript Patterns skills.

Mission: ${mission}

Your deliverable should be formatted as:
[DELIVERABLE:code:ComponentName.tsx]
// Your code implementation
[/DELIVERABLE]

or

[DELIVERABLE:document:Technical Analysis]
# Technical Analysis
Your analysis here...
[/DELIVERABLE]`,
    activeForm: 'Analyzing requirements',
    owner: 'leo',
  });

  await sleep(1000);

  // Task 2: MOMO creates implementation plan (REFERENCES: Agile Planning, Task Breakdown)
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
    subject: 'Create implementation plan and roadmap',
    description: `Break down the mission into actionable steps and create a roadmap. Reference your Agile Planning and Task Breakdown skills.

Mission: ${mission}

Your deliverable should be formatted as:
[DELIVERABLE:plan:Project Roadmap]
# Project Roadmap

## Phase 1: Foundation
- Task 1: ...
- Task 2: ...

## Phase 2: Enhancement
- Task 3: ...
[/DELIVERABLE]`,
    activeForm: 'Planning implementation',
    owner: 'momo',
  });

  await sleep(1000);

  // Task 3: ALEX validates approach (REFERENCES: Testing Strategy, Code Review Checklist)
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
    subject: 'Validate technical approach and test strategy',
    description: `Review the plan and ensure it meets best practices and requirements. Reference your Testing Strategy and Code Review Checklist skills.

Mission: ${mission}

Your deliverable should be formatted as:
[DELIVERABLE:analysis:Validation Report]
# Validation Report

## Summary
Overall assessment...

## Findings
1. **Code Quality**: ...
2. **Testing**: ...

## Recommendations
- ...
[/DELIVERABLE]`,
    activeForm: 'Validating approach',
    owner: 'alex',
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
