/**
 * Claude API Client
 * Handles Claude API integration with retry logic and rate limiting
 */

import Anthropic from '@anthropic-ai/sdk';

interface ClaudeClientConfig {
  apiKey?: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}

export class ClaudeClient {
  private client: Anthropic | null = null;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: ClaudeClientConfig = {}) {
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelay = config.retryDelay ?? 1000; // 1 second default

    // Initialize client if API key is provided
    if (config.apiKey) {
      this.client = new Anthropic({
        apiKey: config.apiKey,
      });
    }
  }

  /**
   * Initialize client with API key from environment
   */
  initialize(apiKey: string): void {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new ClaudeAPIError('API key is required', 401, false);
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Send message to Claude API with retry logic
   */
  async sendMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    if (!this.client) {
      throw new ClaudeAPIError(
        'Claude client not initialized. Please set ANTHROPIC_API_KEY environment variable.',
        401,
        false
      );
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          system: systemPrompt,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        });

        // Extract text content from response
        const content = response.content
          .filter((block) => block.type === 'text')
          .map((block) => (block as { type: 'text'; text: string }).text)
          .join('\n');

        return {
          content,
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        };
      } catch (error) {
        lastError = error as Error;

        // Handle specific Anthropic errors
        if (error instanceof Anthropic.APIError) {
          // Rate limit error (429) - wait and retry
          if (error.status === 429) {
            const retryAfter = this.getRetryAfter(error) || this.retryDelay;

            if (attempt < this.maxRetries) {
              console.warn(
                `Rate limit hit. Retrying after ${retryAfter}ms (attempt ${attempt + 1}/${this.maxRetries})`
              );
              await this.sleep(retryAfter);
              continue;
            }

            throw new ClaudeAPIError(
              'Rate limit exceeded. Please try again later.',
              429,
              true
            );
          }

          // Authentication error (401) - don't retry
          if (error.status === 401) {
            throw new ClaudeAPIError(
              'Invalid API key. Please check ANTHROPIC_API_KEY environment variable.',
              401,
              false
            );
          }

          // Server error (5xx) - retry
          if (error.status && error.status >= 500) {
            if (attempt < this.maxRetries) {
              console.warn(
                `Server error (${error.status}). Retrying in ${this.retryDelay}ms (attempt ${attempt + 1}/${this.maxRetries})`
              );
              await this.sleep(this.retryDelay * (attempt + 1)); // Exponential backoff
              continue;
            }

            throw new ClaudeAPIError(
              'Claude API server error. Please try again later.',
              error.status,
              true
            );
          }

          // Other API errors
          throw new ClaudeAPIError(
            `Claude API error: ${error.message}`,
            error.status,
            false
          );
        }

        // Network or other errors - retry
        if (attempt < this.maxRetries) {
          console.warn(
            `Network error. Retrying in ${this.retryDelay}ms (attempt ${attempt + 1}/${this.maxRetries})`
          );
          await this.sleep(this.retryDelay * (attempt + 1));
          continue;
        }

        // Max retries exceeded
        throw new ClaudeAPIError(
          `Failed after ${this.maxRetries} retries: ${lastError?.message || 'Unknown error'}`,
          undefined,
          false
        );
      }
    }

    // Should never reach here, but TypeScript requires it
    throw new ClaudeAPIError(
      `Failed after ${this.maxRetries} retries: ${lastError?.message || 'Unknown error'}`,
      undefined,
      false
    );
  }

  /**
   * Extract retry-after header from error
   */
  private getRetryAfter(error: any): number | null {
    try {
      const retryAfterHeader = error.headers?.['retry-after'];
      if (retryAfterHeader) {
        const seconds = parseInt(retryAfterHeader, 10);
        if (!isNaN(seconds)) {
          return seconds * 1000; // Convert to milliseconds
        }
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Simple mission analysis using Claude
   * Returns structured agent response
   */
  async analyzeMission(mission: string): Promise<{
    analysis: string;
    tasks: string[];
    agents: {
      leo?: string;
      momo?: string;
      alex?: string;
    };
  }> {
    const systemPrompt = `You are a mission coordinator for a team of AI agents:
- LEO (Code Master): Handles development and implementation
- MOMO (Planning Genius): Creates strategies and plans
- ALEX (Analyst): Performs analysis and verification

Analyze the given mission and provide:
1. A brief analysis of what needs to be done
2. A list of specific tasks to complete
3. Which agent should handle each task

Format your response as JSON:
{
  "analysis": "Brief analysis of the mission",
  "tasks": ["Task 1", "Task 2", "Task 3"],
  "agents": {
    "leo": "What LEO should do",
    "momo": "What MOMO should do",
    "alex": "What ALEX should do"
  }
}`;

    const response = await this.sendMessage(
      [
        {
          role: 'user',
          content: `Mission: ${mission}`,
        },
      ],
      systemPrompt
    );

    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response.content);
      return {
        analysis: parsed.analysis || 'Mission analysis',
        tasks: parsed.tasks || [],
        agents: parsed.agents || {},
      };
    } catch {
      // Fallback if JSON parsing fails
      return {
        analysis: response.content,
        tasks: [mission],
        agents: {
          leo: 'Implement the solution',
          momo: 'Plan the approach',
          alex: 'Verify the results',
        },
      };
    }
  }
}

// Singleton instance
let claudeClient: ClaudeClient | null = null;

/**
 * Get or create Claude client instance
 */
export function getClaudeClient(): ClaudeClient {
  if (!claudeClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    claudeClient = new ClaudeClient({
      apiKey,
      maxRetries: 3,
      retryDelay: 1000,
    });

    // Initialize if API key is available
    if (apiKey) {
      claudeClient.initialize(apiKey);
    }
  }

  return claudeClient;
}

/**
 * Reset client (useful for testing)
 */
export function resetClaudeClient(): void {
  claudeClient = null;
}
