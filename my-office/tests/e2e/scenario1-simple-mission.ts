/**
 * E2E Test Scenario 1: Simple Mission → Deliverables Created
 *
 * This test verifies:
 * 1. User can submit a mission in Real Mode
 * 2. Agents process the mission
 * 3. At least 3 deliverables are created (plan, code, analysis)
 * 4. Mission completes successfully
 */

import fetch from 'node:fetch';

interface TestResult {
  scenario: string;
  passed: boolean;
  details: string;
  duration: number;
  deliverableCount?: number;
  deliverableTypes?: string[];
}

async function runScenario1(): Promise<TestResult> {
  const startTime = Date.now();
  const scenario = 'Scenario 1: Simple Mission → Deliverables';

  console.log('\n=== ' + scenario + ' ===\n');

  try {
    const mission = 'Create a simple React counter component with TypeScript';
    const missionId = `mission-test-${Date.now()}`;

    console.log(`📝 Mission: ${mission}`);
    console.log(`🆔 Mission ID: ${missionId}`);

    // Create SSE connection to claude-team API
    const url = `http://localhost:3000/api/claude-team?mission=${encodeURIComponent(mission)}&mode=real&missionId=${missionId}`;

    console.log(`\n🔌 Connecting to: ${url}\n`);

    const response = await fetch(url, {
      headers: {
        Accept: 'text/event-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let deliverableCount = 0;
    const deliverableTypes: string[] = [];
    let missionComplete = false;
    let collaborationCount = 0;

    // Process SSE stream
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('\n✅ Stream complete');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));

            switch (event.type) {
              case 'agent_status':
                console.log(
                  `👤 ${event.data.agentId.toUpperCase()}: ${event.data.status}`
                );
                break;

              case 'team_log':
                console.log(`📋 ${event.data.content}`);
                break;

              case 'agent_message':
                console.log(
                  `💬 ${event.data.agentId.toUpperCase()}: ${event.data.message.substring(0, 80)}${event.data.message.length > 80 ? '...' : ''}`
                );
                break;

              case 'agent_collaboration':
                collaborationCount++;
                console.log(
                  `🤝 ${event.data.fromAgentId.toUpperCase()} → ${event.data.toAgentId.toUpperCase()}: ${event.data.collaborationType}`
                );
                break;

              case 'mission_deliverable':
                deliverableCount++;
                deliverableTypes.push(event.data.type);
                console.log(
                  `📦 DELIVERABLE #${deliverableCount}: ${event.data.type} - ${event.data.title}`
                );
                console.log(`   Agent: ${event.data.agentId.toUpperCase()}`);
                console.log(
                  `   Content length: ${event.data.content.length} characters`
                );
                break;

              case 'task_progress':
                console.log(
                  `⏳ Task "${event.data.taskName}": ${event.data.progress}% (${event.data.status})`
                );
                break;

              case 'mission_complete':
                missionComplete = true;
                console.log(`\n✅ Mission Complete: ${event.data.message}`);
                break;

              case 'error':
                throw new Error(`API Error: ${event.data.message}`);
            }
          } catch (parseError) {
            console.error('Failed to parse event:', parseError);
          }
        }
      }

      // Timeout after 5 minutes
      if (Date.now() - startTime > 300000) {
        throw new Error('Test timeout after 5 minutes');
      }
    }

    // Validation
    const duration = Date.now() - startTime;

    console.log('\n--- Validation Results ---');
    console.log(`✓ Deliverables created: ${deliverableCount}`);
    console.log(`✓ Deliverable types: ${deliverableTypes.join(', ')}`);
    console.log(`✓ Collaborations: ${collaborationCount}`);
    console.log(`✓ Mission completed: ${missionComplete ? 'Yes' : 'No'}`);
    console.log(`✓ Duration: ${(duration / 1000).toFixed(1)}s`);

    const passed = deliverableCount >= 3 && missionComplete;

    return {
      scenario,
      passed,
      details: passed
        ? `✓ Created ${deliverableCount} deliverables (${deliverableTypes.join(', ')})`
        : `✗ Only ${deliverableCount} deliverables created (expected ≥3)`,
      duration,
      deliverableCount,
      deliverableTypes,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      scenario,
      passed: false,
      details: `✗ Error: ${error instanceof Error ? error.message : String(error)}`,
      duration,
    };
  }
}

// Run if executed directly
if (require.main === module) {
  runScenario1()
    .then((result) => {
      console.log('\n=== Test Result ===');
      console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Details: ${result.details}`);
      console.log(`Duration: ${(result.duration / 1000).toFixed(1)}s`);
      process.exit(result.passed ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { runScenario1 };
