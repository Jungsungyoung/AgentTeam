/**
 * Test Claude API Client
 * Verifies Claude client initialization, error handling, and basic functionality
 */

import { ClaudeClient, ClaudeAPIError } from '../lib/api/claude-client';

async function testClaudeClient() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║  Claude API Client Tests             ║');
  console.log('╚═══════════════════════════════════════╝\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Client initialization without API key
  totalTests++;
  console.log('=== Test 1: Client without API key ===');
  try {
    const client = new ClaudeClient();
    if (!client.isInitialized()) {
      console.log('✓ Client correctly reports uninitialized state\n');
      passedTests++;
    } else {
      console.log('✗ Client should not be initialized without API key\n');
    }
  } catch (error) {
    console.log('✗ Unexpected error:', error);
  }

  // Test 2: Client initialization with API key
  totalTests++;
  console.log('=== Test 2: Client with API key ===');
  try {
    const testKey = process.env.ANTHROPIC_API_KEY || 'sk-test-key';
    const client = new ClaudeClient({ apiKey: testKey });

    if (client.isInitialized()) {
      console.log('✓ Client initialized successfully\n');
      passedTests++;
    } else {
      console.log('✗ Client should be initialized with API key\n');
    }
  } catch (error) {
    console.log('✗ Unexpected error:', error);
  }

  // Test 3: Error handling for uninitialized client
  totalTests++;
  console.log('=== Test 3: Error on API call without initialization ===');
  try {
    const client = new ClaudeClient();
    await client.sendMessage([{ role: 'user', content: 'test' }]);
    console.log('✗ Should throw error when calling API without initialization\n');
  } catch (error) {
    if (error instanceof ClaudeAPIError && error.statusCode === 401) {
      console.log('✓ Correct error thrown for uninitialized client\n');
      passedTests++;
    } else {
      console.log('✗ Wrong error type:', error);
    }
  }

  // Test 4: Initialize method
  totalTests++;
  console.log('=== Test 4: Initialize method ===');
  try {
    const client = new ClaudeClient();
    client.initialize('sk-test-key');

    if (client.isInitialized()) {
      console.log('✓ Client initialized via initialize() method\n');
      passedTests++;
    } else {
      console.log('✗ Initialize method failed\n');
    }
  } catch (error) {
    console.log('✗ Unexpected error:', error);
  }

  // Test 5: Invalid API key error
  totalTests++;
  console.log('=== Test 5: Empty API key validation ===');
  try {
    const client = new ClaudeClient();
    client.initialize('');
    console.log('✗ Should throw error for empty API key\n');
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      console.log('✓ Correct error thrown for empty API key\n');
      passedTests++;
    } else {
      console.log('✗ Wrong error type:', error);
    }
  }

  // Test 6: Real API call (only if API key is set)
  if (process.env.ANTHROPIC_API_KEY) {
    totalTests++;
    console.log('=== Test 6: Real API call (analyzeMission) ===');
    try {
      const client = new ClaudeClient({ apiKey: process.env.ANTHROPIC_API_KEY });
      const result = await client.analyzeMission('Create a simple login page');

      if (result.analysis && result.tasks && result.agents) {
        console.log('✓ API call successful');
        console.log('  Analysis:', result.analysis.substring(0, 100) + '...');
        console.log('  Tasks:', result.tasks.length);
        console.log('  Agents:', Object.keys(result.agents).join(', '));
        console.log('');
        passedTests++;
      } else {
        console.log('✗ Invalid response structure\n');
      }
    } catch (error) {
      if (error instanceof ClaudeAPIError) {
        console.log('✗ API error:', error.message);
        console.log('  Status:', error.statusCode);
        console.log('  Retryable:', error.retryable);
        console.log('');
      } else {
        console.log('✗ Unexpected error:', error);
      }
    }
  } else {
    console.log('=== Test 6: Skipped (no API key) ===');
    console.log('Set ANTHROPIC_API_KEY to test real API calls\n');
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`Tests passed: ${passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log('✅ All tests passed!');
  } else {
    console.log(`❌ ${totalTests - passedTests} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
testClaudeClient().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
