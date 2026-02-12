/**
 * Cost Tracker
 * Track API calls and estimate token usage
 * Saves to local JSON file for persistence
 */

import { promises as fs } from 'fs';
import path from 'path';

interface APICall {
  timestamp: number;
  endpoint: string;
  tokensEstimate: number;
  mode: 'sim' | 'hybrid' | 'real';
  cached: boolean;
}

interface DailyStats {
  date: string;
  totalCalls: number;
  cachedCalls: number;
  apiCalls: number;
  estimatedTokens: number;
  modes: {
    sim: number;
    hybrid: number;
    real: number;
  };
}

class CostTracker {
  private calls: APICall[] = [];
  private statsFile: string;
  private maxCallsInMemory = 1000;

  constructor() {
    // Store stats in project root
    this.statsFile = path.join(
      process.cwd(),
      '..',
      'cost-tracking.json'
    );
  }

  /**
   * Track an API call
   */
  async trackCall(
    endpoint: string,
    tokensEstimate: number,
    mode: 'sim' | 'hybrid' | 'real',
    cached: boolean = false
  ): Promise<void> {
    const call: APICall = {
      timestamp: Date.now(),
      endpoint,
      tokensEstimate,
      mode,
      cached,
    };

    this.calls.push(call);

    // Keep only recent calls in memory
    if (this.calls.length > this.maxCallsInMemory) {
      this.calls.shift();
    }

    // Save to file asynchronously (don't await to not block)
    this.saveToFile().catch((err) => {
      console.error('Failed to save cost tracking:', err);
    });
  }

  /**
   * Get current session statistics
   */
  getSessionStats() {
    const totalCalls = this.calls.length;
    const cachedCalls = this.calls.filter((c) => c.cached).length;
    const apiCalls = totalCalls - cachedCalls;
    const estimatedTokens = this.calls.reduce(
      (sum, c) => sum + c.tokensEstimate,
      0
    );

    const modes = {
      sim: this.calls.filter((c) => c.mode === 'sim').length,
      hybrid: this.calls.filter((c) => c.mode === 'hybrid').length,
      real: this.calls.filter((c) => c.mode === 'real').length,
    };

    return {
      totalCalls,
      cachedCalls,
      apiCalls,
      estimatedTokens,
      modes,
      cacheHitRate:
        totalCalls > 0 ? ((cachedCalls / totalCalls) * 100).toFixed(2) : '0',
    };
  }

  /**
   * Get daily statistics
   */
  getDailyStats(): DailyStats {
    const today = new Date().toISOString().split('T')[0];
    const todayCalls = this.calls.filter((c) => {
      const callDate = new Date(c.timestamp).toISOString().split('T')[0];
      return callDate === today;
    });

    const cachedCalls = todayCalls.filter((c) => c.cached).length;
    const apiCalls = todayCalls.length - cachedCalls;

    return {
      date: today,
      totalCalls: todayCalls.length,
      cachedCalls,
      apiCalls,
      estimatedTokens: todayCalls.reduce((sum, c) => sum + c.tokensEstimate, 0),
      modes: {
        sim: todayCalls.filter((c) => c.mode === 'sim').length,
        hybrid: todayCalls.filter((c) => c.mode === 'hybrid').length,
        real: todayCalls.filter((c) => c.mode === 'real').length,
      },
    };
  }

  /**
   * Estimate tokens for a mission
   * Simple heuristic: ~1 token per 4 characters
   */
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Save tracking data to JSON file
   */
  private async saveToFile(): Promise<void> {
    try {
      const stats = {
        lastUpdated: new Date().toISOString(),
        sessionStats: this.getSessionStats(),
        dailyStats: this.getDailyStats(),
        recentCalls: this.calls.slice(-50), // Last 50 calls
      };

      await fs.writeFile(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (error) {
      // File operations might fail (permissions, disk space)
      // We don't want to crash the app, just log the error
      if (error instanceof Error) {
        console.error('Cost tracker save error:', error.message);
      }
    }
  }

  /**
   * Load existing stats from file
   */
  async loadFromFile(): Promise<void> {
    try {
      const data = await fs.readFile(this.statsFile, 'utf-8');
      const parsed = JSON.parse(data);

      if (parsed.recentCalls && Array.isArray(parsed.recentCalls)) {
        this.calls = parsed.recentCalls;
      }
    } catch (error) {
      // File might not exist on first run - that's fine
      if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
        console.error('Failed to load cost tracking:', error);
      }
    }
  }

  /**
   * Clear all tracking data
   */
  async clear(): Promise<void> {
    this.calls = [];
    try {
      await fs.unlink(this.statsFile);
    } catch (error) {
      // File might not exist - that's fine
    }
  }

  /**
   * Check if cost limits are exceeded
   */
  checkLimits(maxCostAlert: number, maxTokensPerDay: number): {
    exceeded: boolean;
    warnings: string[];
  } {
    const dailyStats = this.getDailyStats();
    const warnings: string[] = [];

    if (dailyStats.estimatedTokens > maxTokensPerDay) {
      warnings.push(
        `Daily token limit exceeded: ${dailyStats.estimatedTokens}/${maxTokensPerDay}`
      );
    }

    if (dailyStats.apiCalls > maxCostAlert) {
      warnings.push(
        `Daily API call limit exceeded: ${dailyStats.apiCalls}/${maxCostAlert}`
      );
    }

    return {
      exceeded: warnings.length > 0,
      warnings,
    };
  }
}

// Export singleton instance
export const costTracker = new CostTracker();

// Export class for testing
export { CostTracker };
