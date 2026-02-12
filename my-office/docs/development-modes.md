# Development Modes Guide

My Office supports three development modes to optimize development workflow and minimize API costs.

## Quick Start

```bash
# Simulation mode (default) - No API costs
npm run dev:sim

# Hybrid mode - Use cache when possible
npm run dev:hybrid

# Real mode - Always call API
npm run dev:real
```

## Mode Comparison

| Feature | Simulation | Hybrid | Real |
|---------|-----------|--------|------|
| API Calls | None | Only for new missions | Every mission |
| Response Time | Instant | Fast (cached) / Slow (API) | Slow |
| Cost | Free | Low | High |
| Use Case | Development | Testing | Production-like |
| Requires API Key | No | Yes | Yes |

## Simulation Mode

**When to use:**
- Initial development and UI testing
- Fast iteration on visual components
- Offline development
- Learning the codebase

**How it works:**
- Returns predefined responses instantly
- No network calls
- Perfect for testing animations and UI
- No API key required

**Example:**
```bash
npm run dev:sim
```

## Hybrid Mode

**When to use:**
- Testing with real AI responses
- Developing integration features
- Running repeated tests efficiently
- Minimizing development costs

**How it works:**
1. First mission execution: Calls Claude API
2. Response is cached with mission hash
3. Same mission: Returns cached response
4. New mission: Calls API and caches

**Cache behavior:**
- In-memory cache (cleared on restart)
- TTL: 24 hours (configurable)
- Max size: 100 entries (LRU eviction)
- Normalized mission matching (case-insensitive, whitespace-insensitive)

**Example:**
```bash
# .env.local
MODE=hybrid
CACHE_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-xxx

npm run dev:hybrid
```

## Real Mode

**When to use:**
- Final testing before deployment
- Validating latest API changes
- Testing dynamic responses
- Production-like behavior

**How it works:**
- Every mission triggers Claude API call
- No caching (fresh responses)
- Accurate token usage tracking
- Highest cost, most realistic

**Example:**
```bash
# .env.local
MODE=real
ANTHROPIC_API_KEY=sk-ant-xxx

npm run dev:real
```

## Cost Monitoring

All API usage is automatically tracked in `cost-tracking.json` at the project root.

### Tracking Data

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
      "endpoint": "/api/mission",
      "tokensEstimate": 350,
      "mode": "hybrid",
      "cached": false
    }
  ]
}
```

### Cost Alerts

Configure alerts in `.env.local`:

```bash
# Alert after 1000 API calls per day
MAX_COST_ALERT=1000

# Alert after 100k tokens per day
MAX_TOKENS_PER_DAY=100000
```

When limits are exceeded, warnings appear in console.

## Cache Management

### Cache Statistics

```typescript
import { missionCache } from '@/lib/cache';

// Get cache stats
const stats = missionCache.getStats();
console.log(stats);
// {
//   size: 42,
//   validEntries: 40,
//   totalHits: 120,
//   maxSize: 100,
//   ttl: 86400000
// }
```

### Manual Cache Control

```typescript
import { missionCache } from '@/lib/cache';

// Clear all cache
missionCache.clear();

// Clean expired entries
const cleaned = missionCache.cleanExpired();
console.log(`Cleaned ${cleaned} expired entries`);

// Get cache key for a mission
const key = missionCache.getCacheKey('Build a dashboard');
```

## Cost Tracking API

### Track Custom Calls

```typescript
import { costTracker } from '@/lib/monitoring';

// Track an API call
await costTracker.trackCall(
  '/api/mission',
  350, // estimated tokens
  'hybrid',
  false // not cached
);

// Get session stats
const stats = costTracker.getSessionStats();

// Check limits
const { exceeded, warnings } = costTracker.checkLimits(1000, 100000);
if (exceeded) {
  console.warn(warnings);
}
```

### Token Estimation

```typescript
import { CostTracker } from '@/lib/monitoring';

// Estimate tokens for text
const mission = 'Build a dashboard with authentication';
const tokens = CostTracker.estimateTokens(mission);
console.log(`Estimated ${tokens} tokens`);
```

## Best Practices

### Development Workflow

1. **Start with Simulation**
   - Build UI and components
   - Test animations and interactions
   - No API key needed

2. **Move to Hybrid**
   - Test with real AI responses
   - Leverage cache for repeated tests
   - Monitor cost in `cost-tracking.json`

3. **Final Testing in Real**
   - Validate production behavior
   - Test edge cases
   - Verify latest API changes

### Cost Optimization

1. **Use cache effectively**
   ```bash
   # Enable cache in .env.local
   CACHE_ENABLED=true
   ```

2. **Monitor daily usage**
   ```bash
   # Check cost-tracking.json regularly
   cat ../cost-tracking.json
   ```

3. **Set conservative limits**
   ```bash
   # .env.local
   MAX_COST_ALERT=100
   MAX_TOKENS_PER_DAY=10000
   ```

4. **Clear cache when needed**
   - After API changes
   - When testing different prompts
   - After agent behavior updates

## Troubleshooting

### Cache not working in Hybrid mode

1. Check `CACHE_ENABLED=true` in `.env.local`
2. Verify mission text is identical (case/whitespace differences bypass cache)
3. Check cache hasn't expired (24h TTL by default)

### API key errors

```bash
# Ensure API key is set for hybrid/real modes
ANTHROPIC_API_KEY=sk-ant-xxx
```

### Cost tracking file not created

1. Check write permissions in project root
2. Ensure parent directory exists
3. Check console for error messages

## Configuration Reference

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| MODE | `sim\|hybrid\|real` | `sim` | Development mode |
| CACHE_ENABLED | `boolean` | `true` | Enable caching (hybrid mode) |
| MAX_COST_ALERT | `number` | `1000` | Daily API call limit |
| MAX_TOKENS_PER_DAY | `number` | `100000` | Daily token limit |
| ANTHROPIC_API_KEY | `string` | - | Claude API key (required for hybrid/real) |

### Cache Configuration

Edit `my-office/lib/cache/mission-cache.ts`:

```typescript
// Adjust cache settings
const cache = new MissionCache(
  100,        // maxSize: Maximum cached entries
  86400000    // ttl: Time to live (24 hours in ms)
);
```

## Next Steps

- **Phase 2**: Redis integration for persistent cache
- **Phase 3**: Advanced cost analytics dashboard
- **Phase 4**: Team-wide cost pooling and limits
