/**
 * Claude Code Wrapper Usage Example
 *
 * Demonstrates basic usage of the ClaudeCodeWrapper class
 */

import { ClaudeCodeWrapper } from './wrapper';

async function example() {
  // Initialize wrapper
  const wrapper = new ClaudeCodeWrapper({
    cliPath: 'claude-code',
    timeout: 300000,
  });

  console.log('🚀 Starting Claude Code Wrapper Example\n');

  // Listen for all team events
  wrapper.on('teamEvent', (event) => {
    console.log(`[${event.type}] ${JSON.stringify(event.data)}`);
  });

  // Listen for agent messages specifically
  wrapper.on('event:AGENT_MESSAGE', (event) => {
    console.log(`💬 Agent message:`, event.data);
  });

  try {
    // Step 1: Create team
    console.log('📝 Creating team...');
    const createResult = await wrapper.createTeam({
      teamName: 'example-team',
      agents: ['leo', 'momo', 'alex'],
      maxAgents: 5,
    });

    if (!createResult.success) {
      throw new Error(`Team creation failed: ${createResult.error}`);
    }

    console.log('✅ Team created successfully\n');

    // Step 2: Start monitoring
    console.log('👀 Starting team monitoring...');
    await wrapper.monitorTeam('example-team');
    console.log('✅ Monitoring started\n');

    // Step 3: Create a task
    console.log('📋 Creating task...');
    const taskResult = await wrapper.createTask({
      teamName: 'example-team',
      subject: 'Build authentication module',
      description:
        'Implement JWT-based authentication with refresh tokens and secure session management',
      activeForm: 'Building authentication module',
    });

    if (taskResult.success) {
      console.log('✅ Task created\n');
    }

    // Step 4: Send a message
    console.log('📤 Sending message to LEO...');
    await wrapper.sendMessage({
      teamName: 'example-team',
      recipient: 'leo',
      message: 'Start working on the authentication module',
      type: 'message',
    });
    console.log('✅ Message sent\n');

    // Step 5: Check team status
    const status = wrapper.getTeamStatus('example-team');
    console.log('📊 Team Status:', {
      status: status?.status,
      createdAt: status?.createdAt,
      eventCount: status?.events.length,
    });

    // Let the team run for 30 seconds
    console.log('\n⏳ Running team for 30 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Step 6: Shutdown
    console.log('\n🛑 Shutting down team...');
    await wrapper.shutdownTeam('example-team');
    console.log('✅ Team shutdown complete');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Ensure cleanup
    await wrapper.shutdownAll();
    console.log('\n✨ Example complete');
  }
}

// Run example if executed directly
if (require.main === module) {
  example().catch(console.error);
}

export { example };
