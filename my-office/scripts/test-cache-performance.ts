/**
 * Test Cache Performance Fix
 * Verifies that cached responses stream instantly
 */

async function testCachePerformance() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║  Cache Performance Test              ║');
  console.log('╚═══════════════════════════════════════╝\n');

  const API_URL = 'http://localhost:3000/api/claude-team';
  const testMission = 'Create a login page';

  console.log('Starting performance test...\n');
  console.log('Mission:', testMission);
  console.log('Mode: hybrid\n');

  // Test 1: First call (cache miss)
  console.log('=== Test 1: Cache Miss (First Call) ===');
  const start1 = Date.now();

  try {
    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission: testMission, mode: 'hybrid' }),
    });

    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}`);
    }

    const reader1 = response1.body?.getReader();
    const decoder = new TextDecoder();
    let eventCount1 = 0;

    if (reader1) {
      while (true) {
        const { done, value } = await reader1.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter((l) => l.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            eventCount1++;
          }
        }
      }
    }

    const duration1 = Date.now() - start1;
    console.log(`✓ Cache miss completed`);
    console.log(`  Events: ${eventCount1}`);
    console.log(`  Time: ${duration1}ms`);
    console.log(`  Expected: >1000ms (API call with delays)`);

    if (duration1 > 1000) {
      console.log('  ✅ Performance as expected\n');
    } else {
      console.log('  ⚠️  Unexpectedly fast\n');
    }
  } catch (error) {
    console.error('✗ Test 1 failed:', error);
    return;
  }

  // Wait 1 second before second call
  console.log('Waiting 1 second...\n');
  await sleep(1000);

  // Test 2: Second call (cache hit)
  console.log('=== Test 2: Cache Hit (Second Call) ===');
  const start2 = Date.now();

  try {
    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission: testMission, mode: 'hybrid' }),
    });

    if (!response2.ok) {
      throw new Error(`HTTP ${response2.status}`);
    }

    const reader2 = response2.body?.getReader();
    const decoder = new TextDecoder();
    let eventCount2 = 0;

    if (reader2) {
      while (true) {
        const { done, value } = await reader2.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter((l) => l.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            eventCount2++;
          }
        }
      }
    }

    const duration2 = Date.now() - start2;
    console.log(`✓ Cache hit completed`);
    console.log(`  Events: ${eventCount2}`);
    console.log(`  Time: ${duration2}ms`);
    console.log(`  Expected: <100ms (instant cache replay)`);

    if (duration2 < 100) {
      console.log('  ✅ EXCELLENT! Cache performance optimized!\n');
    } else if (duration2 < 500) {
      console.log('  ⚠️  Good but could be faster\n');
    } else {
      console.log('  ❌ SLOW! Cache performance issue detected\n');
    }
  } catch (error) {
    console.error('✗ Test 2 failed:', error);
    return;
  }

  console.log('═══════════════════════════════════════');
  console.log('Performance test complete!\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check server
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/claude-team?mission=test&mode=simulation');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error('❌ Server is not running on http://localhost:3000\n');
    console.log('Please start the server first:');
    console.log('  cd my-office');
    console.log('  npm run dev:hybrid\n');
    process.exit(1);
  }

  await testCachePerformance();
}

main().catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});
