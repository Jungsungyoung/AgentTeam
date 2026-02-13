/**
 * Test Hybrid Mode Integration
 * Tests the hybrid mode with cache and Claude API integration
 */

import { missionCache } from './my-office/lib/cache/mission-cache';
import { costTracker } from './my-office/lib/monitoring/cost-tracker';

async function testHybridMode() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║  Hybrid Mode Integration Test        ║');
  console.log('╚═══════════════════════════════════════╝\n');

  const API_URL = 'http://localhost:3000/api/claude-team';
  const testMission = 'Create a simple login page with username and password fields';

  // Clear cache and cost tracking before tests
  missionCache.clear();
  await costTracker.clear();

  console.log('=== Test 1: First call (cache miss) ===');
  console.log('Mission:', testMission);
  console.log('Mode: hybrid\n');

  try {
    // First call - should miss cache and call API (or simulation if no API key)
    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mission: testMission,
        mode: 'hybrid',
      }),
    });

    if (!response1.ok) {
      throw new Error(`HTTP error! status: ${response1.status}`);
    }

    console.log('Response status:', response1.status);
    console.log('Content-Type:', response1.headers.get('Content-Type'));

    // Read SSE stream
    const reader = response1.body?.getReader();
    const decoder = new TextDecoder();
    let eventCount = 0;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            eventCount++;
            const eventData = JSON.parse(line.slice(6));
            console.log(`Event ${eventCount}:`, eventData.type, '-', eventData.data);
          }
        }
      }
    }

    console.log(`\nTotal events received: ${eventCount}`);

    // Check cache
    const cacheStats = missionCache.getStats();
    console.log('\nCache stats after first call:');
    console.log('  Size:', cacheStats.size);
    console.log('  Valid entries:', cacheStats.validEntries);

    // Check cost tracking
    const sessionStats = costTracker.getSessionStats();
    console.log('\nCost tracking:');
    console.log('  Total calls:', sessionStats.totalCalls);
    console.log('  Cached calls:', sessionStats.cachedCalls);
    console.log('  API calls:', sessionStats.apiCalls);
    console.log('  Cache hit rate:', sessionStats.cacheHitRate + '%');
  } catch (error) {
    console.error('✗ Test 1 failed:', error);
    return;
  }

  console.log('\n=== Test 2: Second call (cache hit) ===');
  console.log('Same mission - should hit cache\n');

  try {
    // Second call - should hit cache
    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mission: testMission,
        mode: 'hybrid',
      }),
    });

    if (!response2.ok) {
      throw new Error(`HTTP error! status: ${response2.status}`);
    }

    const reader = response2.body?.getReader();
    const decoder = new TextDecoder();
    let eventCount = 0;
    let foundCacheHitLog = false;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            eventCount++;
            const eventData = JSON.parse(line.slice(6));

            if (
              eventData.type === 'team_log' &&
              eventData.data.content?.includes('Cache hit')
            ) {
              foundCacheHitLog = true;
              console.log('✓ Cache hit detected:', eventData.data.content);
            }
          }
        }
      }
    }

    console.log(`Total events received: ${eventCount}`);

    if (foundCacheHitLog) {
      console.log('\n✓ Cache working correctly');
    } else {
      console.log('\n✗ Cache hit not detected in logs');
    }

    // Final stats
    const finalStats = costTracker.getSessionStats();
    console.log('\nFinal cost tracking:');
    console.log('  Total calls:', finalStats.totalCalls);
    console.log('  Cached calls:', finalStats.cachedCalls);
    console.log('  API calls:', finalStats.apiCalls);
    console.log('  Cache hit rate:', finalStats.cacheHitRate + '%');

    if (finalStats.totalCalls === 2 && finalStats.cachedCalls >= 1) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n⚠ Warning: Expected 2 total calls with 1 cached call');
    }
  } catch (error) {
    console.error('✗ Test 2 failed:', error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/claude-team?mission=test&mode=simulation');
    return response.ok;
  } catch {
    return false;
  }
}

// Run tests
async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error('❌ Server is not running on http://localhost:3000');
    console.log('\nPlease start the server first:');
    console.log('  cd my-office');
    console.log('  npm run dev:hybrid\n');
    process.exit(1);
  }

  await testHybridMode();
}

main().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
