import { NextRequest } from 'next/server';
import { ClaudeCodeWrapper } from '@/lib/claude-code/wrapper';
import type { ChatMessageEvent } from '@/lib/types/sse';

/**
 * Chat API Endpoint - Phase 3
 *
 * Purpose: Bidirectional chat between user and AI agents
 *
 * Features:
 * - POST endpoint receives user message to specific agent
 * - Returns SSE stream for agent's response
 * - Integrates with Claude Code Agent Team via ClaudeCodeWrapper
 */

export interface ChatRequest {
  missionId: string;
  agentId: 'leo' | 'momo' | 'alex';
  message: string;
  from?: 'user';
}

export interface ChatEvent {
  type: 'chat_message' | 'error' | 'complete';
  timestamp: string;
  data: ChatMessageEvent | { error: string } | { success: boolean };
}

/**
 * POST /api/chat
 *
 * Send a message to a specific agent and stream their response
 *
 * Request body:
 * {
 *   "missionId": "mission-123",
 *   "agentId": "leo",
 *   "message": "Can you explain the implementation?"
 * }
 *
 * Response: SSE stream with chat_message events
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { missionId, agentId, message } = body;

    // Validation
    if (!missionId || typeof missionId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Mission ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!agentId || !['leo', 'momo', 'alex'].includes(agentId)) {
      return new Response(
        JSON.stringify({ error: 'Valid agent ID required (leo, momo, or alex)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message content is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create SSE stream
    return createChatStream(missionId, agentId, message);
  } catch (error) {
    console.error('Chat API error:', error);
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
 * Create SSE stream for chat conversation
 */
function createChatStream(
  missionId: string,
  agentId: string,
  userMessage: string
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: ChatEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        // Send user message event
        sendEvent({
          type: 'chat_message',
          timestamp: new Date().toISOString(),
          data: {
            messageId: `msg-${Date.now()}-user`,
            missionId,
            from: 'user',
            to: agentId as any,
            message: userMessage,
            timestamp: new Date().toISOString(),
          },
        });

        // Initialize Claude Code wrapper
        const wrapper = new ClaudeCodeWrapper({
          cliPath: 'claude-code',
          workingDirectory: process.cwd(),
          timeout: 60000, // 1 minute for chat responses
        });

        const teamName = `team-${missionId.slice(0, 8)}`;

        // Send message to agent via Claude Code
        const result = await wrapper.sendMessage({
          teamName,
          recipient: agentId,
          message: userMessage,
          type: 'message',
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to send message to agent');
        }

        // Listen for agent's response
        // Note: In real implementation, we'd monitor the team's output
        // For now, simulate agent response based on persona
        await simulateAgentResponse(agentId, userMessage, missionId, sendEvent);

        // Send completion event
        sendEvent({
          type: 'complete',
          timestamp: new Date().toISOString(),
          data: { success: true },
        });

        controller.close();
      } catch (error) {
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
 * Simulate agent response based on persona
 * TODO: Replace with real Claude Code team monitoring in production
 */
async function simulateAgentResponse(
  agentId: string,
  userMessage: string,
  missionId: string,
  sendEvent: (event: ChatEvent) => void
): Promise<void> {
  // Simulate thinking delay
  await sleep(800);

  // Generate persona-appropriate response
  let response = '';

  switch (agentId) {
    case 'leo':
      response = generateLeoResponse(userMessage);
      break;
    case 'momo':
      response = generateMomoResponse(userMessage);
      break;
    case 'alex':
      response = generateAlexResponse(userMessage);
      break;
  }

  // Send agent's response
  sendEvent({
    type: 'chat_message',
    timestamp: new Date().toISOString(),
    data: {
      messageId: `msg-${Date.now()}-${agentId}`,
      missionId,
      from: agentId as any,
      to: 'user',
      message: response,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Generate LEO's response (Code Master - direct, technical)
 */
function generateLeoResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('how') || msg.includes('implement')) {
    return "I'll implement this with TypeScript and React best practices. Need to break it down into components and ensure type safety. Should take about 30 minutes.";
  }

  if (msg.includes('error') || msg.includes('bug')) {
    return "Let me check the stack trace. Usually it's a TypeScript type mismatch or missing dependency. I'll debug and fix it.";
  }

  if (msg.includes('explain') || msg.includes('why')) {
    return "The code works this way because we're following React patterns. It's cleaner and more maintainable than alternatives.";
  }

  return "Got it. I'll handle the implementation. Will coordinate with MOMO if I need clarification on requirements.";
}

/**
 * Generate MOMO's response (Planning Genius - structured, organized)
 */
function generateMomoResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('plan') || msg.includes('roadmap')) {
    return "Let me create a structured plan:\n\n1. Define requirements\n2. Break into phases\n3. Identify dependencies\n4. Create timeline\n\nI'll have a detailed roadmap ready shortly.";
  }

  if (msg.includes('priority') || msg.includes('order')) {
    return "Based on dependencies and impact, here's my suggested priority:\n\n1. Critical infrastructure setup\n2. Core features\n3. Nice-to-have enhancements\n\nWe should tackle them in this sequence.";
  }

  if (msg.includes('risk') || msg.includes('concern')) {
    return "I've identified potential risks:\n\n- Timeline constraints\n- Technical complexity\n- Resource availability\n\nI recommend we create a mitigation plan for each.";
  }

  return "I'll analyze this from a planning perspective and create a detailed breakdown. Let me coordinate with LEO and ALEX to ensure alignment.";
}

/**
 * Generate ALEX's response (Analyst - analytical, quality-focused)
 */
function generateAlexResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('test') || msg.includes('quality')) {
    return "From a testing perspective, we need:\n\n- Unit tests for core logic\n- Integration tests for API\n- E2E tests for user flows\n\nI'll create a comprehensive test strategy.";
  }

  if (msg.includes('review') || msg.includes('analyze')) {
    return "I've analyzed the approach. Here's my assessment:\n\n✓ Strengths: Clean architecture, good type safety\n⚠ Concerns: Edge case handling, performance optimization\n\nRecommendations to follow.";
  }

  if (msg.includes('performance') || msg.includes('optimize')) {
    return "Performance analysis shows potential bottlenecks:\n\n1. Unnecessary re-renders\n2. Large bundle size\n3. API call frequency\n\nI suggest profiling and optimization.";
  }

  return "I'll validate this from a quality assurance perspective. Need to ensure it meets best practices and doesn't introduce risks.";
}

/**
 * Utility: Sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
