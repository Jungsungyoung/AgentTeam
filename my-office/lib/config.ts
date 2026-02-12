/**
 * Environment Configuration
 * Centralized config for development modes and API settings
 */

export type Mode = 'sim' | 'hybrid' | 'real';

interface Config {
  mode: Mode;
  cacheEnabled: boolean;
  maxCostAlert: number;
  maxTokensPerDay: number;
  anthropicApiKey?: string;
}

/**
 * Get environment configuration
 * Falls back to simulation mode if not set
 */
export function getConfig(): Config {
  const mode = (process.env.MODE || 'sim') as Mode;
  const cacheEnabled = process.env.CACHE_ENABLED === 'true';
  const maxCostAlert = parseInt(process.env.MAX_COST_ALERT || '1000', 10);
  const maxTokensPerDay = parseInt(
    process.env.MAX_TOKENS_PER_DAY || '100000',
    10
  );
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  return {
    mode,
    cacheEnabled,
    maxCostAlert,
    maxTokensPerDay,
    anthropicApiKey,
  };
}

/**
 * Check if API key is required for current mode
 */
export function isApiKeyRequired(): boolean {
  const { mode } = getConfig();
  return mode === 'hybrid' || mode === 'real';
}

/**
 * Validate configuration
 * Throws error if required values are missing
 */
export function validateConfig(): void {
  const config = getConfig();

  if (!['sim', 'hybrid', 'real'].includes(config.mode)) {
    throw new Error(
      `Invalid MODE: ${config.mode}. Must be sim, hybrid, or real.`
    );
  }

  if (isApiKeyRequired() && !config.anthropicApiKey) {
    throw new Error(
      `ANTHROPIC_API_KEY is required for ${config.mode} mode. Please set it in .env.local`
    );
  }
}

/**
 * Get human-readable mode description
 */
export function getModeDescription(mode: Mode): string {
  const descriptions = {
    sim: 'Simulation - No API calls, instant responses',
    hybrid: 'Hybrid - Cached responses + API for new missions',
    real: 'Real - Always use Claude API',
  };

  return descriptions[mode];
}
