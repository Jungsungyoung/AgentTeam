# Integration Quick Start

Quick reference for using the development infrastructure (Task #4).

## Import Patterns

```typescript
// Configuration
import { getConfig, isApiKeyRequired, validateConfig } from '@/lib/config';

// Caching
import { missionCache } from '@/lib/cache';

// Cost Tracking
import { costTracker, CostTracker } from '@/lib/monitoring';
```

## Common Use Cases

### 1. Check Current Mode

```typescript
import { getConfig } from '@/lib/config';

const config = getConfig();
console.log(config.mode); // 'sim' | 'hybrid' | 'real'

if (config.mode === 'sim') {
  // Return mock data
}
```

### 2. Cache API Responses (Hybrid Mode)

```typescript
import { missionCache } from '@/lib/cache';
import { getConfig } from '@/lib/config';

async function processMission(mission: string) {
  const config = getConfig();

  // Check cache in hybrid mode
  if (config.mode === 'hybrid' && config.cacheEnabled) {
    const cached = missionCache.get(mission);
    if (cached) {
      console.log('Cache hit!');
      return cached;
    }
  }

  // Call API
  const response = await callClaudeAPI(mission);

  // Store in cache
  if (config.mode === 'hybrid' && config.cacheEnabled) {
    missionCache.set(mission, response);
  }

  return response;
}
```

### 3. Track API Costs

```typescript
import { costTracker, CostTracker } from '@/lib/monitoring';

async function callAPI(mission: string) {
  const start = Date.now();

  // Estimate tokens
  const estimatedTokens = CostTracker.estimateTokens(mission);

  // Make API call
  const response = await fetch('/api/claude', { ... });

  // Track the call
  await costTracker.trackCall(
    '/api/claude',
    estimatedTokens,
    'hybrid',
    false // not cached
  );

  return response;
}
```

### 4. Display Cost Stats in UI

```typescript
import { costTracker } from '@/lib/monitoring';

function CostStatsPanel() {
  const stats = costTracker.getSessionStats();

  return (
    <div>
      <p>Total Calls: {stats.totalCalls}</p>
      <p>API Calls: {stats.apiCalls}</p>
      <p>Cached: {stats.cachedCalls}</p>
      <p>Cache Hit Rate: {stats.cacheHitRate}%</p>
      <p>Estimated Tokens: {stats.estimatedTokens}</p>
    </div>
  );
}
```

### 5. Validate Configuration on Startup

```typescript
import { validateConfig } from '@/lib/config';

// In app initialization
try {
  validateConfig();
} catch (error) {
  console.error('Invalid configuration:', error.message);
  // Show error UI
}
```

### 6. Check Cost Limits

```typescript
import { costTracker } from '@/lib/monitoring';
import { getConfig } from '@/lib/config';

const config = getConfig();
const { exceeded, warnings } = costTracker.checkLimits(
  config.maxCostAlert,
  config.maxTokensPerDay
);

if (exceeded) {
  warnings.forEach(w => console.warn(w));
  // Show warning UI
}
```

## Mode-Specific Logic

```typescript
import { getConfig } from '@/lib/config';

const config = getConfig();

switch (config.mode) {
  case 'sim':
    // Return mock data immediately
    return mockResponse;

  case 'hybrid':
    // Check cache first, then API
    const cached = missionCache.get(mission);
    return cached || await callAPI(mission);

  case 'real':
    // Always call API
    return await callAPI(mission);
}
```

## Environment Variables

Set in `.env.local`:

```bash
# Required
MODE=sim|hybrid|real

# Optional (with defaults)
CACHE_ENABLED=true
MAX_COST_ALERT=1000
MAX_TOKENS_PER_DAY=100000

# Required for hybrid/real modes
ANTHROPIC_API_KEY=sk-ant-xxx
```

## NPM Scripts

```bash
npm run dev:sim      # Development with simulation
npm run dev:hybrid   # Development with cache + API
npm run dev:real     # Development with always API
npm run test:cache   # Test infrastructure
```

## Cache API

```typescript
import { missionCache } from '@/lib/cache';

// Get (returns null if not found/expired)
const response = missionCache.get(mission);

// Set
missionCache.set(mission, response);

// Clear all
missionCache.clear();

// Clean expired
const cleaned = missionCache.cleanExpired();

// Get stats
const stats = missionCache.getStats();
// { size, validEntries, totalHits, maxSize, ttl }

// Manual cache key
const key = missionCache.getCacheKey(mission);
```

## Cost Tracker API

```typescript
import { costTracker, CostTracker } from '@/lib/monitoring';

// Track call
await costTracker.trackCall(
  endpoint: string,
  tokensEstimate: number,
  mode: 'sim' | 'hybrid' | 'real',
  cached: boolean
);

// Session stats
const session = costTracker.getSessionStats();
// { totalCalls, cachedCalls, apiCalls, estimatedTokens, cacheHitRate, modes }

// Daily stats
const daily = costTracker.getDailyStats();
// { date, totalCalls, cachedCalls, apiCalls, estimatedTokens, modes }

// Check limits
const { exceeded, warnings } = costTracker.checkLimits(maxCalls, maxTokens);

// Estimate tokens
const tokens = CostTracker.estimateTokens(text);

// Clear tracking
await costTracker.clear();
```

## Config API

```typescript
import { getConfig, isApiKeyRequired, validateConfig, getModeDescription } from '@/lib/config';

// Get config
const config = getConfig();
// { mode, cacheEnabled, maxCostAlert, maxTokensPerDay, anthropicApiKey? }

// Check API key requirement
const required = isApiKeyRequired(); // true for hybrid/real

// Validate (throws on error)
validateConfig();

// Get description
const desc = getModeDescription('hybrid');
// "Hybrid - Cached responses + API for new missions"
```

## Testing

```bash
# Run infrastructure tests
npm run test:cache

# Check cost tracking file
cat ../cost-tracking.json
```

## Common Patterns

### Bridge Service Pattern

```typescript
import { getConfig } from '@/lib/config';
import { missionCache } from '@/lib/cache';
import { costTracker, CostTracker } from '@/lib/monitoring';

export async function processMission(mission: string) {
  const config = getConfig();

  // Simulation mode
  if (config.mode === 'sim') {
    return simulateMission(mission);
  }

  // Check cache (hybrid mode)
  if (config.mode === 'hybrid' && config.cacheEnabled) {
    const cached = missionCache.get(mission);
    if (cached) {
      await costTracker.trackCall('/api/mission', 0, 'hybrid', true);
      return cached;
    }
  }

  // Call API
  const tokens = CostTracker.estimateTokens(mission);
  const response = await callClaudeAPI(mission);

  await costTracker.trackCall('/api/mission', tokens, config.mode, false);

  // Cache response (hybrid mode)
  if (config.mode === 'hybrid' && config.cacheEnabled) {
    missionCache.set(mission, response);
  }

  return response;
}
```

### React Hook Pattern

```typescript
import { useEffect, useState } from 'react';
import { costTracker } from '@/lib/monitoring';

export function useCostStats() {
  const [stats, setStats] = useState(costTracker.getSessionStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(costTracker.getSessionStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}
```

## File Locations

```
my-office/
├── lib/
│   ├── cache/
│   │   ├── mission-cache.ts    # Cache implementation
│   │   └── index.ts            # Exports
│   ├── monitoring/
│   │   ├── cost-tracker.ts     # Cost tracking
│   │   └── index.ts            # Exports
│   └── config.ts               # Configuration
├── .env.example                # Template
└── .env.local                  # Your settings

cost-tracking.json              # Auto-generated (project root)
```

## Full Documentation

- **Development Modes Guide**: `docs/development-modes.md`
- **Setup Summary**: `../SETUP_PHASE2_WEEK1.md`
- **README**: `../README.md` (mode switching section)
