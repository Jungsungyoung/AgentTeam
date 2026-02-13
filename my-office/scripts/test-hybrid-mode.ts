/**
 * Test Hybrid Mode Implementation
 *
 * Tests:
 * 1. Cache miss on first request (executes simulation)
 * 2. Cache hit on second identical request (replays cached session)
 * 3. Cost tracking for both scenarios
 */

import { missionCache } from '../lib/cache/mission-cache';
import { costTracker } from '../lib/monitoring/cost-tracker';

async function testHybridMode() {
  console.log('🧪 Testing Hybrid Mode Implementation\n');

  // Clear cache and cost tracking
  missionCache.clear();
  await costTracker.clear();

  const testMission = 'Create a login page with authentication';
  const baseUrl = 'http://localhost:3000';

  console.log('📊 Initial State:');
  console.log('Cache stats:', missionCache.getStats());
  console.log('Cost stats:', costTracker.getSessionStats());
  console.log();

  // Test 1: First request (cache miss)
  console.log('🔄 Test 1: First request (cache miss expected)');
  try {
    const response1 = await fetch(`${baseUrl}/api/claude-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mission: testMission,
        mode: 'hybrid',
        missionId: 'test-001',
      }),
    });

    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
    }

    // Read SSE stream
    const reader = response1.body?.getReader();
    const decoder = new TextDecoder();
    let eventCount = 0;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            eventCount++;
            console.log(`  Event ${eventCount}:`, data.type, '-', data.data.message || data.data.status);
          }
        }
      }
    }

    console.log(`✅ First request completed (${eventCount} events)`);
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
    return;
  }

  console.log();
  console.log('📊 After Test 1:');
  console.log('Cache stats:', missionCache.getStats());
  console.log('Cost stats:', costTracker.getSessionStats());
  console.log();

  // Wait a bit before second request
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Second request (cache hit)
  console.log('🔄 Test 2: Second identical request (cache hit expected)');
  try {
    const response2 = await fetch(`${baseUrl}/api/claude-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mission: testMission,
        mode: 'hybrid',
        missionId: 'test-002',
      }),
    });

    if (!response2.ok) {
      throw new Error(`HTTP ${response2.status}: ${response2.statusText}`);
    }

    // Read SSE stream
    const reader = response2.body?.getReader();
    const decoder = new TextDecoder();
    let eventCount = 0;
    let cacheHitDetected = false;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            eventCount++;
            const message = data.data.message || data.data.status || '';
            console.log(`  Event ${eventCount}:`, data.type, '-', message);

            if (message.includes('Cache hit')) {
              cacheHitDetected = true;
            }
          }
        }
      }
    }

    console.log(`✅ Second request completed (${eventCount} events)`);
    console.log(cacheHitDetected ? '✅ Cache hit detected!' : '❌ Cache hit NOT detected');
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
    return;
  }

  console.log();
  console.log('📊 Final State:');
  const cacheStats = missionCache.getStats();
  const costStats = costTracker.getSessionStats();

  console.log('Cache stats:', cacheStats);
  console.log('Cost stats:', costStats);
  console.log();

  // Validation
  console.log('🎯 Validation:');
  const validations = [
    {
      name: 'Cache has 1 entry',
      pass: cacheStats.validEntries === 1,
    },
    {
      name: 'Cache had 1 hit',
      pass: cacheStats.totalHits === 1,
    },
    {
      name: 'Total 2 calls tracked',
      pass: costStats.totalCalls === 2,
    },
    {
      name: 'One call was cached',
      pass: costStats.cachedCalls === 1,
    },
    {
      name: 'Cache hit rate is 50%',
      pass: costStats.cacheHitRate === '50.00',
    },
  ];

  let allPassed = true;
  for (const validation of validations) {
    console.log(validation.pass ? '✅' : '❌', validation.name);
    if (!validation.pass) allPassed = false;
  }

  console.log();
  console.log(allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed');
}

// Run tests
testHybridMode().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
