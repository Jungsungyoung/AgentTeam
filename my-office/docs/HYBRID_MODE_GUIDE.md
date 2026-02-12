# Hybrid Mode User Guide

**Version**: Phase 2 Week 2
**Last Updated**: 2026-02-13
**Author**: Documentation Team

---

## Overview

Hybrid Mode is a cost-effective development mode that intelligently balances real AI responses with cached data. It's designed to minimize API costs during development while maintaining access to authentic Claude AI agent behavior.

### Key Benefits

- **Cost Optimization**: Use real API only for new missions
- **Fast Iteration**: Instant responses for repeated tests
- **Authentic Behavior**: Real Claude AI responses when needed
- **Smart Caching**: Automatic cache management with LRU eviction

---

## Quick Start

### 1. Setup API Key

Create or edit `.env.local` in the `my-office/` directory:

```bash
# Copy from example
cp .env.example .env.local
```

Add your Anthropic API key:

```bash
MODE=hybrid
CACHE_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**Getting an API Key:**
1. Visit [https://console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste into `.env.local`

### 2. Start Development Server

```bash
cd my-office
npm run dev:hybrid
```

Or use the default dev command (it reads MODE from .env.local):

```bash
npm run dev
```

### 3. Execute Your First Mission

Open [http://localhost:3000](http://localhost:3000) and:

1. Select "Hybrid" mode from the dropdown
2. Enter a mission: e.g., "Create a login page with email and password"
3. Click "Execute Mission"
4. Watch agents collaborate in real-time

**First execution**: Calls Claude API (2-5 seconds)
**Second execution** (same mission): Instant response from cache

---

## How Hybrid Mode Works

### Architecture

```
User Mission
    ↓
Bridge Service (/api/claude-team)
    ↓
Check Cache (mission hash)
    ├─ HIT  → Playback cached events (instant)
    └─ MISS → Call Claude API
              ↓
              Store in cache
              ↓
              Stream events to client
```

### Caching Strategy

**Cache Key Generation:**
```typescript
// Mission text is normalized before hashing
"Build a dashboard"
  → lowercase
  → trim whitespace
  → hash
  → "build-a-dashboard-abc123"
```

**What Gets Cached:**
- Complete SSE event sequence
- Agent status changes
- Agent messages
- Team collaboration logs
- Mission completion data

**What Doesn't Get Cached:**
- Timestamps (recalculated on playback)
- Real-time metrics
- User-specific data

### Cache Lifecycle

1. **Creation**: First API response is stored
2. **Retrieval**: Subsequent identical missions use cache
3. **Expiration**: 24 hours (configurable)
4. **Eviction**: LRU (Least Recently Used) when max size reached

---

## Mode Comparison

| Feature | Simulation | Hybrid | Real |
|---------|-----------|--------|------|
| **API Calls** | None | Only new missions | Every mission |
| **Response Time** | Instant (~0ms) | Mixed (0ms / 2-5s) | Always slow (2-5s) |
| **Cost** | $0 | Low (~10-20 calls/day) | High (100+ calls/day) |
| **Authenticity** | Scripted | Real AI (cached) | Real AI (fresh) |
| **Cache** | N/A | Enabled | Disabled |
| **API Key Required** | No | Yes | Yes |
| **Best For** | UI development | Feature development | Final testing |

### When to Use Each Mode

**Use Simulation When:**
- Building UI components
- Testing animations
- Developing offline
- Learning the codebase
- No API key available

**Use Hybrid When:**
- Developing new features
- Testing with real AI responses
- Running repeated integration tests
- Minimizing development costs
- Most day-to-day development

**Use Real When:**
- Final pre-production testing
- Validating latest Claude API changes
- Testing edge cases with fresh responses
- Demonstrating to stakeholders

---

## Configuration

### Environment Variables

```bash
# .env.local

# Mode selection (required)
MODE=hybrid

# Enable caching (recommended for hybrid mode)
CACHE_ENABLED=true

# Claude API key (required for hybrid/real modes)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Cost monitoring thresholds
MAX_COST_ALERT=1000           # Alert after 1000 API calls/day
MAX_TOKENS_PER_DAY=100000     # Alert after 100k tokens/day
```

### Cache Settings

Edit `my-office/lib/cache/mission-cache.ts` to customize:

```typescript
const cache = new MissionCache(
  100,        // maxSize: Maximum cached missions (default: 100)
  86400000    // ttl: Time-to-live in ms (default: 24 hours)
);
```

**Recommended Settings:**

| Scenario | Max Size | TTL |
|----------|----------|-----|
| Individual Developer | 50 | 24h |
| Small Team | 100 | 48h |
| Large Team | 200 | 72h |
| CI/CD Pipeline | 500 | 7 days |

---

## Cost Optimization Tips

### 1. Maximize Cache Hits

**✅ Do:**
- Use consistent mission phrasing
- Test with same missions repeatedly
- Share missions across team (same cache)

**❌ Don't:**
- Rephrase identical missions
- Add timestamps or user names to missions
- Clear cache unnecessarily

### 2. Monitor Usage

Check `cost-tracking.json` in project root:

```bash
cat ../cost-tracking.json
```

Example output:
```json
{
  "sessionStats": {
    "totalCalls": 42,
    "cachedCalls": 35,
    "apiCalls": 7,
    "cacheHitRate": "83.33%"
  },
  "dailyStats": {
    "estimatedTokens": 15000,
    "modes": {
      "hybrid": 42
    }
  }
}
```

**Good cache hit rate**: > 70%
**Excellent cache hit rate**: > 85%

### 3. Set Conservative Limits

```bash
# .env.local - For individual development
MAX_COST_ALERT=100            # Alert after 100 calls
MAX_TOKENS_PER_DAY=10000      # Alert after 10k tokens
```

Console will show warnings when limits are exceeded:
```
⚠️ Warning: Daily API call limit reached (100/100)
⚠️ Warning: Daily token limit reached (10000/10000)
```

### 4. Clear Cache Strategically

**Clear cache when:**
- Updating Claude API prompts
- Changing agent behavior
- Testing different response variations
- Starting a new feature

**Keep cache when:**
- Fixing unrelated bugs
- Updating UI
- Running integration tests
- Daily development

### 5. Estimated Costs

Based on Claude API pricing (as of 2026):

| Usage Pattern | API Calls/Day | Est. Tokens/Day | Est. Cost/Month |
|---------------|---------------|-----------------|-----------------|
| Light (UI work) | 10 | 5,000 | $5-10 |
| Medium (Feature dev) | 50 | 25,000 | $20-30 |
| Heavy (Integration tests) | 200 | 100,000 | $80-120 |

**Note**: Hybrid mode typically reduces costs by 70-85% compared to Real mode.

---

## Troubleshooting

### Cache Not Working

**Symptom**: Every mission calls API even when repeated

**Causes & Solutions:**

1. **Cache disabled**
   ```bash
   # Check .env.local
   CACHE_ENABLED=true
   ```

2. **Mission text variations**
   ```typescript
   // ❌ These won't match cache
   "Build a dashboard"
   "Build a Dashboard"
   "build a dashboard "  // trailing space

   // ✅ These will match (normalized)
   "build a dashboard"
   "Build a dashboard"
   "BUILD A DASHBOARD"
   ```

3. **Cache expired**
   - Default TTL: 24 hours
   - Check cache stats to verify

4. **Cache cleared/restarted**
   - Cache is in-memory (cleared on server restart)
   - Phase 3 will add Redis for persistent cache

### API Key Errors

**Error**: `ANTHROPIC_API_KEY is required for hybrid mode`

**Solution:**
```bash
# 1. Check .env.local exists in my-office/ directory
ls my-office/.env.local

# 2. Verify API key is set
grep ANTHROPIC_API_KEY my-office/.env.local

# 3. Restart dev server
npm run dev
```

**Error**: `Invalid API key format`

**Solution:**
- API keys start with `sk-ant-`
- Check for extra spaces or newlines
- Regenerate key from Anthropic console if needed

### Slow Hybrid Mode Responses

**Symptom**: Hybrid mode as slow as Real mode

**Diagnosis:**
```bash
# Check cache hit rate
cat ../cost-tracking.json | grep cacheHitRate
```

**If cache hit rate < 50%:**
- Missions are too varied
- Use more consistent test cases
- Check cache size (may be too small)

**If cache hit rate > 70% but still slow:**
- Slow first API call is normal
- Check network connection
- Verify Anthropic API status

### Cost Tracking File Not Created

**Error**: `cost-tracking.json` not found

**Solution:**
```bash
# 1. Check write permissions
cd /path/to/02_AgentTeam_02
touch cost-tracking.json
rm cost-tracking.json

# 2. Check console for errors
# Look for "Failed to write cost tracking" messages

# 3. Manually create file
echo '{"sessionStats":{}}' > cost-tracking.json
```

---

## Advanced Usage

### Manual Cache Control

```typescript
import { missionCache } from '@/lib/cache';

// Get cache statistics
const stats = missionCache.getStats();
console.log(`Cache: ${stats.size}/${stats.maxSize} entries`);
console.log(`Hits: ${stats.totalHits}`);
console.log(`Valid: ${stats.validEntries}`);

// Clear entire cache
missionCache.clear();

// Clean only expired entries
const removed = missionCache.cleanExpired();
console.log(`Removed ${removed} expired entries`);

// Get cache key for a mission
const key = missionCache.getCacheKey('Build a dashboard');
console.log(`Cache key: ${key}`);
```

### Custom Cost Tracking

```typescript
import { costTracker } from '@/lib/monitoring';

// Track a custom API call
await costTracker.trackCall(
  '/api/custom-endpoint',
  500,      // estimated tokens
  'hybrid',
  false     // not cached
);

// Get current session stats
const session = costTracker.getSessionStats();
console.log(`Session: ${session.apiCalls} API calls`);

// Check if limits exceeded
const { exceeded, warnings } = costTracker.checkLimits(1000, 100000);
if (exceeded) {
  warnings.forEach(w => console.warn(w));
}
```

### Custom Cache TTL per Mission Type

```typescript
// Example: Cache simple missions longer, complex missions shorter
const simpleMissionTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const complexMissionTTL = 6 * 60 * 60 * 1000;     // 6 hours

// Extend MissionCache class to support custom TTL
// (Implementation detail for advanced users)
```

---

## API Reference

### POST /api/claude-team

Execute a mission in Hybrid mode.

**Request:**
```typescript
POST /api/claude-team
Content-Type: application/json

{
  "mission": "Create a login page with email and password",
  "mode": "hybrid",
  "missionId": "optional-custom-id"
}
```

**Response:**
```
Content-Type: text/event-stream

data: {"type":"team_log","timestamp":"2026-02-13T10:00:00Z","data":{...}}

data: {"type":"agent_status","timestamp":"2026-02-13T10:00:01Z","data":{...}}

data: {"type":"mission_complete","timestamp":"2026-02-13T10:00:05Z","data":{...}}
```

**Cache Behavior:**
- **Cache HIT**: Events stream immediately with recalculated timestamps
- **Cache MISS**: Events stream as Claude API responds, then cached

### GET /api/claude-team

EventSource-compatible endpoint (same functionality as POST).

**Request:**
```
GET /api/claude-team?mission=Create%20a%20login%20page&mode=hybrid&missionId=xyz
```

**Response:** Same SSE stream as POST

---

## Migration Guide

### From Simulation to Hybrid

1. **Get API Key** (see Quick Start above)

2. **Update .env.local:**
   ```bash
   # Before
   MODE=sim

   # After
   MODE=hybrid
   CACHE_ENABLED=true
   ANTHROPIC_API_KEY=sk-ant-xxx
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

4. **Test with one mission:**
   - First run: Should call API (2-5s)
   - Second run: Should use cache (instant)

5. **Monitor costs:**
   ```bash
   cat ../cost-tracking.json
   ```

### From Hybrid to Real

1. **Update .env.local:**
   ```bash
   MODE=real
   # CACHE_ENABLED is ignored in real mode
   ```

2. **Restart server**

3. **Verify behavior:**
   - Every mission should call API
   - No cache hits in cost-tracking.json

---

## Best Practices

### Development Workflow

**Week 1-2: UI Development**
```bash
MODE=sim
```
- Fast iteration
- No costs
- Perfect for UI/UX work

**Week 3-4: Feature Development**
```bash
MODE=hybrid
CACHE_ENABLED=true
```
- Real AI responses
- Cost-effective testing
- Build core functionality

**Week 5: Integration Testing**
```bash
MODE=hybrid
MAX_COST_ALERT=500
```
- Increased limits
- Repeated test scenarios
- High cache hit rate

**Week 6: Final Testing**
```bash
MODE=real
```
- Production-like behavior
- Validate edge cases
- Pre-launch testing

### Team Collaboration

1. **Shared Cache** (Future: Phase 3)
   - Redis-backed cache
   - Team members share cached responses
   - Even higher cache hit rates

2. **Cost Pooling**
   - Set team-wide limits
   - Monitor aggregate usage
   - Rotate API keys if needed

3. **Documentation**
   - Document common test missions
   - Share mission templates
   - Maintain test case library

---

## FAQ

**Q: Can I use Hybrid mode offline?**
A: No, Hybrid mode requires network access to Claude API for cache misses. Use Simulation mode for offline work.

**Q: How long are responses cached?**
A: Default 24 hours. Configurable in `lib/cache/mission-cache.ts`.

**Q: Does cache persist across server restarts?**
A: No, Phase 2 uses in-memory cache. Phase 3 will add Redis for persistence.

**Q: Can I share cache between team members?**
A: Not in Phase 2. Phase 3 will add Redis for team-wide cache sharing.

**Q: What's the difference between Hybrid and Real mode cost?**
A: Hybrid typically uses 70-85% fewer API calls due to caching.

**Q: Can I use different modes for different missions?**
A: Yes, mode is set per mission in the UI or API request.

**Q: How accurate is token estimation?**
A: Rough estimate (~4 characters per token). Real usage tracked via Anthropic API response.

**Q: Can I disable cost tracking?**
A: Not recommended, but you can ignore `cost-tracking.json`. Tracking has minimal overhead.

---

## Next Steps

- **Phase 2 Week 3**: Real mode with full Claude Code CLI integration
- **Phase 3**: Redis cache, team collaboration, advanced analytics
- **Phase 4**: Production deployment, rate limiting, monitoring

---

**Need Help?**
- Check [development-modes.md](./development-modes.md) for mode comparison
- See [INTEGRATION_QUICK_START.md](./INTEGRATION_QUICK_START.md) for setup
- Review [WEEK1_INTEGRATION_TEST_REPORT.md](../WEEK1_INTEGRATION_TEST_REPORT.md) for testing

**Feedback:**
Report issues at [GitHub Issues](https://github.com/your-org/my-office/issues)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-13
**Contributors**: Documentation Team, Phase 2 Week 2
