/**
 * E2E Test Suite Runner
 *
 * Runs all 4 E2E test scenarios and generates a comprehensive report
 */

import { runScenario1 } from './scenario1-simple-mission';
import { runScenario2 } from './scenario2-user-prompt';
import { runScenario3 } from './scenario3-collaboration';
import { runScenario4 } from './scenario4-skill-application';

interface TestResult {
  scenario: string;
  passed: boolean;
  details: string;
  duration: number;
  [key: string]: any;
}

async function runAllTests(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                  Real Mode E2E Test Suite                        ║');
  console.log('║                   Phase 5 Integration Tests                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');

  const startTime = Date.now();
  const results: TestResult[] = [];

  // Scenario 1: Simple Mission
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('TEST 1/4: Simple Mission → Deliverables');
  console.log('═'.repeat(70));

  try {
    const result1 = await runScenario1();
    results.push(result1);
  } catch (error) {
    console.error('Scenario 1 failed to execute:', error);
    results.push({
      scenario: 'Scenario 1: Simple Mission',
      passed: false,
      details: `Failed to execute: ${error}`,
      duration: 0,
    });
  }

  // Wait between tests
  await sleep(2000);

  // Scenario 2: User Prompt
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('TEST 2/4: User Prompt Flow');
  console.log('═'.repeat(70));

  try {
    const result2 = await runScenario2();
    results.push(result2);
  } catch (error) {
    console.error('Scenario 2 failed to execute:', error);
    results.push({
      scenario: 'Scenario 2: User Prompt',
      passed: false,
      details: `Failed to execute: ${error}`,
      duration: 0,
    });
  }

  // Wait between tests
  await sleep(2000);

  // Scenario 3: Collaboration
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('TEST 3/4: Agent Collaboration');
  console.log('═'.repeat(70));

  try {
    const result3 = await runScenario3();
    results.push(result3);
  } catch (error) {
    console.error('Scenario 3 failed to execute:', error);
    results.push({
      scenario: 'Scenario 3: Collaboration',
      passed: false,
      details: `Failed to execute: ${error}`,
      duration: 0,
    });
  }

  // Wait between tests
  await sleep(2000);

  // Scenario 4: Skill Application
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('TEST 4/4: Skill Application');
  console.log('═'.repeat(70));

  try {
    const result4 = await runScenario4();
    results.push(result4);
  } catch (error) {
    console.error('Scenario 4 failed to execute:', error);
    results.push({
      scenario: 'Scenario 4: Skill Application',
      passed: false,
      details: `Failed to execute: ${error}`,
      duration: 0,
    });
  }

  // Generate final report
  const totalDuration = Date.now() - startTime;
  generateReport(results, totalDuration);

  // Exit with appropriate code
  const allPassed = results.every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
}

function generateReport(results: TestResult[], totalDuration: number): void {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST RESULTS SUMMARY                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  console.log('\n📊 Overall Statistics:');
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed: ${passedCount} ✅`);
  console.log(`   Failed: ${failedCount} ❌`);
  console.log(`   Success Rate: ${((passedCount / results.length) * 100).toFixed(1)}%`);
  console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);

  console.log('\n📋 Individual Results:');
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`\n   ${index + 1}. ${result.scenario}`);
    console.log(`      Status: ${status}`);
    console.log(`      Details: ${result.details}`);
    console.log(`      Duration: ${(result.duration / 1000).toFixed(1)}s`);

    // Additional metrics if available
    if ('deliverableCount' in result && result.deliverableCount !== undefined) {
      console.log(`      Deliverables: ${result.deliverableCount}`);
    }
    if ('collaborationCount' in result && result.collaborationCount !== undefined) {
      console.log(`      Collaborations: ${result.collaborationCount}`);
    }
  });

  console.log('\n' + '═'.repeat(70));

  if (passedCount === results.length) {
    console.log('🎉 ALL TESTS PASSED! Real Mode integration is working correctly.');
  } else {
    console.log(`⚠️  ${failedCount} test(s) failed. Please review the details above.`);
  }

  console.log('═'.repeat(70) + '\n');

  // Save results to JSON file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: passedCount,
      failed: failedCount,
      successRate: (passedCount / results.length) * 100,
      totalDuration,
    },
    results,
  };

  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, `test-results-${Date.now()}.json`);

  try {
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Full test report saved to: ${reportPath}\n`);
  } catch (error) {
    console.error('Failed to save test report:', error);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run all tests
runAllTests().catch((error) => {
  console.error('Test suite execution failed:', error);
  process.exit(1);
});
