/**
 * E2E Test Scenario 4: Skill Application → Agents Use Skill Documents
 *
 * This test verifies:
 * 1. Agents reference their skill documents in outputs
 * 2. LEO uses React/TypeScript best practices
 * 3. MOMO uses Agile planning methodology
 * 4. ALEX uses testing strategies
 */

import fetch from 'node:fetch';

interface TestResult {
  scenario: string;
  passed: boolean;
  details: string;
  duration: number;
  skillReferences?: {
    leo: boolean;
    momo: boolean;
    alex: boolean;
  };
}

async function runScenario4(): Promise<TestResult> {
  const startTime = Date.now();
  const scenario = 'Scenario 4: Skill Application';

  console.log('\n=== ' + scenario + ' ===\n');

  try {
    // Mission that requires all agents to apply their skills
    const mission =
      'Build a user profile feature with: React component (LEO), implementation plan (MOMO), and test strategy (ALEX)';
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

    // Skill keywords to look for
    const skillKeywords = {
      leo: [
        'typescript',
        'react',
        'component',
        'props',
        'state',
        'hook',
        'type safety',
        'interface',
      ],
      momo: [
        'plan',
        'phase',
        'roadmap',
        'task',
        'breakdown',
        'dependencies',
        'timeline',
        'milestone',
      ],
      alex: ['test', 'testing', 'quality', 'validation', 'coverage', 'e2e', 'unit test'],
    };

    const agentOutputs: Record<string, string[]> = {
      leo: [],
      momo: [],
      alex: [],
    };

    const skillReferences = {
      leo: false,
      momo: false,
      alex: false,
    };

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
                // Check for skill loading confirmation
                if (event.data.content.includes('Loaded') && event.data.content.includes('skill')) {
                  console.log(`📚 ${event.data.content}`);
                }
                break;

              case 'agent_message':
                const agentId = event.data.agentId as 'leo' | 'momo' | 'alex';
                const message = event.data.message.toLowerCase();

                // Store agent output
                agentOutputs[agentId].push(message);

                // Check for skill keyword usage
                const keywords = skillKeywords[agentId];
                const foundKeywords = keywords.filter((kw) => message.includes(kw));

                if (foundKeywords.length > 0) {
                  skillReferences[agentId] = true;
                  console.log(
                    `\n✨ ${agentId.toUpperCase()} using skill keywords: ${foundKeywords.join(', ')}`
                  );
                }

                console.log(
                  `💬 ${agentId.toUpperCase()}: ${event.data.message.substring(0, 100)}${event.data.message.length > 100 ? '...' : ''}`
                );
                break;

              case 'mission_deliverable':
                const delivAgentId = event.data.agentId as 'leo' | 'momo' | 'alex';
                const content = event.data.content.toLowerCase();

                // Store deliverable content
                agentOutputs[delivAgentId].push(content);

                // Check for skill keyword usage in deliverables
                const delivKeywords = skillKeywords[delivAgentId];
                const foundDelivKeywords = delivKeywords.filter((kw) => content.includes(kw));

                if (foundDelivKeywords.length > 0) {
                  skillReferences[delivAgentId] = true;
                  console.log(
                    `\n📦 ${delivAgentId.toUpperCase()} deliverable "${event.data.title}" uses skill keywords:`
                  );
                  console.log(`   ${foundDelivKeywords.join(', ')}`);
                }
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

    console.log('\n--- Skill Application Analysis ---');
    console.log(`LEO (React/TypeScript): ${skillReferences.leo ? '✓ Applied' : '✗ Not detected'}`);
    console.log(`MOMO (Planning): ${skillReferences.momo ? '✓ Applied' : '✗ Not detected'}`);
    console.log(`ALEX (Testing): ${skillReferences.alex ? '✓ Applied' : '✗ Not detected'}`);
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);

    // Pass if at least 2 agents applied their skills
    const appliedCount = Object.values(skillReferences).filter(Boolean).length;
    const passed = appliedCount >= 2;

    return {
      scenario,
      passed,
      details: passed
        ? `✓ ${appliedCount}/3 agents applied their skills`
        : `✗ Only ${appliedCount}/3 agents applied their skills (expected ≥2)`,
      duration,
      skillReferences,
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
  runScenario4()
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

export { runScenario4 };
