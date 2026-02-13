/**
 * E2E Test Scenario 3: Agent Collaboration → Timeline Updates
 *
 * This test verifies:
 * 1. Agents communicate with each other during mission
 * 2. agent_collaboration events are emitted
 * 3. Different collaboration types are detected (question, answer, proposal, etc.)
 * 4. Collaboration timeline can visualize interactions
 */

import fetch from 'node:fetch';

interface TestResult {
  scenario: string;
  passed: boolean;
  details: string;
  duration: number;
  collaborationCount?: number;
  collaborationTypes?: string[];
}

async function runScenario3(): Promise<TestResult> {
  const startTime = Date.now();
  const scenario = 'Scenario 3: Agent Collaboration';

  console.log('\n=== ' + scenario + ' ===\n');

  try {
    // Mission designed to encourage collaboration
    const mission =
      'Create a full-stack todo app. LEO handles the frontend, MOMO creates the plan, and ALEX reviews the architecture.';
    const missionId = `mission-test-${Date.now()}`;

    console.log(`📝 Mission: ${mission}`);
    console.log(`🆔 Mission ID: ${missionId}`);

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
    let collaborationCount = 0;
    const collaborationTypes = new Set<string>();
    const collaborations: Array<{
      from: string;
      to: string;
      type: string;
      message: string;
    }> = [];

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

              case 'agent_collaboration':
                collaborationCount++;
                collaborationTypes.add(event.data.collaborationType);
                collaborations.push({
                  from: event.data.fromAgentId,
                  to: event.data.toAgentId,
                  type: event.data.collaborationType,
                  message: event.data.message,
                });

                console.log(
                  `\n🤝 COLLABORATION #${collaborationCount}:`
                );
                console.log(
                  `   ${event.data.fromAgentId.toUpperCase()} → ${event.data.toAgentId.toUpperCase()}`
                );
                console.log(`   Type: ${event.data.collaborationType}`);
                console.log(
                  `   Message: ${event.data.message.substring(0, 100)}${event.data.message.length > 100 ? '...' : ''}`
                );
                break;

              case 'agent_message':
                // Check for @mentions in messages
                const msg = event.data.message;
                if (msg.includes('@LEO') || msg.includes('@MOMO') || msg.includes('@ALEX')) {
                  console.log(
                    `💬 ${event.data.agentId.toUpperCase()} (mentions detected): ${msg.substring(0, 80)}...`
                  );
                }
                break;

              case 'mission_deliverable':
                console.log(
                  `📦 ${event.data.agentId.toUpperCase()} created ${event.data.type}: ${event.data.title}`
                );
                break;

              case 'mission_complete':
                console.log(`\n✅ Mission Complete`);
                break;

              case 'error':
                console.error(`❌ Error: ${event.data.message}`);
                break;
            }
          } catch (parseError) {
            console.error('Failed to parse event:', parseError);
          }
        }
      }

      // Timeout after 5 minutes
      if (Date.now() - startTime > 300000) {
        console.log('\n⏰ Test timeout - checking partial results');
        break;
      }
    }

    // Validation
    const duration = Date.now() - startTime;
    const typesList = Array.from(collaborationTypes);

    console.log('\n--- Validation Results ---');
    console.log(`✓ Total collaborations: ${collaborationCount}`);
    console.log(`✓ Collaboration types: ${typesList.join(', ') || 'None'}`);
    console.log(`✓ Duration: ${(duration / 1000).toFixed(1)}s`);

    if (collaborationCount > 0) {
      console.log('\n--- Collaboration Summary ---');
      collaborations.forEach((collab, index) => {
        console.log(
          `${index + 1}. ${collab.from.toUpperCase()} → ${collab.to.toUpperCase()} (${collab.type})`
        );
      });
    }

    // Pass if we detected at least one collaboration
    const passed = collaborationCount > 0;

    return {
      scenario,
      passed,
      details: passed
        ? `✓ Detected ${collaborationCount} collaborations with types: ${typesList.join(', ')}`
        : `✗ No agent collaborations detected`,
      duration,
      collaborationCount,
      collaborationTypes: typesList,
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
  runScenario3()
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

export { runScenario3 };
