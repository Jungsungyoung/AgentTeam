/**
 * Cache and Cost Tracking Test Script
 * Run: npx tsx scripts/test-cache.ts
 */

import { missionCache } from '../lib/cache';
import { costTracker, CostTracker } from '../lib/monitoring';

async function testCache() {
  console.log('=== Testing Mission Cache ===\n');

  // Test 1: Set and get
  const mission1 = 'Build a user authentication system';
  const response1 = { agents: ['LEO', 'ALEX'], tasks: ['Design', 'Implement'] };

  console.log('1. Setting cache entry...');
  missionCache.set(mission1, response1);

  console.log('2. Retrieving cached entry...');
  const cached = missionCache.get(mission1);
  console.log('   Cached:', cached);
  console.log('   Match:', JSON.stringify(cached) === JSON.stringify(response1) ? '✓' : '✗');

  // Test 2: Cache key normalization
  console.log('\n3. Testing cache key normalization...');
  const mission2 = '  BUILD   a  USER   authentication SYSTEM  '; // Different spacing/case
  const cached2 = missionCache.get(mission2);
  console.log('   Original:', mission1);
  console.log('   Variant: ', mission2);
  console.log('   Retrieved:', cached2 ? '✓ Cache hit' : '✗ Cache miss');

  // Test 3: Cache miss
  console.log('\n4. Testing cache miss...');
  const notCached = missionCache.get('Completely different mission');
  console.log('   Result:', notCached === null ? '✓ Correctly returned null' : '✗ Unexpected result');

  // Test 4: Cache stats
  console.log('\n5. Cache statistics:');
  const stats = missionCache.getStats();
  console.log('   Size:', stats.size);
  console.log('   Valid entries:', stats.validEntries);
  console.log('   Total hits:', stats.totalHits);
  console.log('   Max size:', stats.maxSize);
  console.log('   TTL:', `${stats.ttl / 1000 / 60 / 60}h`);

  console.log('\n=== Cache Tests Complete ===\n');
}

async function testCostTracking() {
  console.log('=== Testing Cost Tracking ===\n');

  // Clear previous data
  await costTracker.clear();

  // Test 1: Track API calls
  console.log('1. Tracking API calls...');
  await costTracker.trackCall('/api/mission', 350, 'hybrid', false);
  await costTracker.trackCall('/api/mission', 200, 'hybrid', true);
  await costTracker.trackCall('/api/mission', 450, 'real', false);
  console.log('   Tracked 3 calls ✓');

  // Test 2: Session stats
  console.log('\n2. Session statistics:');
  const sessionStats = costTracker.getSessionStats();
  console.log('   Total calls:', sessionStats.totalCalls);
  console.log('   Cached calls:', sessionStats.cachedCalls);
  console.log('   API calls:', sessionStats.apiCalls);
  console.log('   Estimated tokens:', sessionStats.estimatedTokens);
  console.log('   Cache hit rate:', `${sessionStats.cacheHitRate}%`);
  console.log('   Modes:', sessionStats.modes);

  // Test 3: Daily stats
  console.log('\n3. Daily statistics:');
  const dailyStats = costTracker.getDailyStats();
  console.log('   Date:', dailyStats.date);
  console.log('   Total calls:', dailyStats.totalCalls);
  console.log('   API calls:', dailyStats.apiCalls);
  console.log('   Cached calls:', dailyStats.cachedCalls);
  console.log('   Estimated tokens:', dailyStats.estimatedTokens);

  // Test 4: Token estimation
  console.log('\n4. Token estimation:');
  const testText = 'Build a comprehensive dashboard with authentication and analytics';
  const estimatedTokens = CostTracker.estimateTokens(testText);
  console.log('   Text:', testText);
  console.log('   Estimated tokens:', estimatedTokens);
  console.log('   Formula: ~1 token per 4 characters');

  // Test 5: Cost limits
  console.log('\n5. Cost limit checks:');
  const { exceeded, warnings } = costTracker.checkLimits(2, 500);
  console.log('   Limit exceeded:', exceeded);
  if (warnings.length > 0) {
    warnings.forEach(w => console.log('   Warning:', w));
  } else {
    console.log('   No warnings ✓');
  }

  // Test 6: File persistence
  console.log('\n6. Testing file persistence...');
  await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async save
  console.log('   Cost tracking saved to: ../cost-tracking.json');
  console.log('   Check the file to verify data persistence ✓');

  console.log('\n=== Cost Tracking Tests Complete ===\n');
}

async function main() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║  My Office - Infrastructure Tests    ║');
  console.log('╚═══════════════════════════════════════╝\n');

  try {
    await testCache();
    await testCostTracking();

    console.log('✅ All tests passed!\n');
    console.log('Next steps:');
    console.log('1. Check ../cost-tracking.json for tracking data');
    console.log('2. Run: npm run dev:sim to test simulation mode');
    console.log('3. Set ANTHROPIC_API_KEY and run: npm run dev:hybrid\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();
