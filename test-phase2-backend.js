/**
 * Test script for Phase 2 backend enhancements
 * Validates parsing logic without full Next.js build
 */

// Test parseDeliverable function
function parseDeliverable(message, agentId, missionId) {
  const regex = /\[DELIVERABLE:(\w+):([^\]]+)\]([\s\S]*?)\[\/DELIVERABLE\]/;
  const match = message.match(regex);

  if (!match) {
    return null;
  }

  const [, type, title, content] = match;
  const validTypes = ['code', 'document', 'analysis', 'plan'];

  if (!validTypes.includes(type)) {
    console.warn(`Invalid deliverable type: ${type}`);
    return null;
  }

  return {
    deliverableId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    missionId,
    agentId,
    type,
    title: title.trim(),
    content: content.trim(),
  };
}

// Test detectCollaboration function
function detectCollaboration(message, fromAgentId) {
  const agentNames = ['LEO', 'MOMO', 'ALEX'];
  const agentIds = ['leo', 'momo', 'alex'];

  for (let i = 0; i < agentNames.length; i++) {
    const name = agentNames[i];
    const id = agentIds[i];

    if (id === fromAgentId) continue;

    const mentionPattern = new RegExp(`(@${name}|${name}[,:]|Hey ${name}|${name} -)`);
    if (mentionPattern.test(message)) {
      let collaborationType = 'question';
      if (message.includes('?')) collaborationType = 'question';
      else if (message.includes('approve') || message.includes('agree')) collaborationType = 'approval';
      else if (message.includes('propose') || message.includes('suggest')) collaborationType = 'proposal';
      else if (message.includes('handoff') || message.includes('your turn')) collaborationType = 'handoff';
      else collaborationType = 'answer';

      return {
        fromAgentId,
        toAgentId: id,
        message: message.trim(),
        collaborationType,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return null;
}

// Test parseUserPromptRequest function
function parseUserPromptRequest(message, agentId) {
  const regex = /\[USER_PROMPT\]([\s\S]*?)\[\/USER_PROMPT\]/;
  const match = message.match(regex);

  if (!match) {
    return null;
  }

  const question = match[1].trim();

  return {
    agentId,
    question,
    requiresResponse: true,
  };
}

// Run tests
console.log('=== Testing Phase 2 Backend Enhancements ===\n');

// Test 1: Parse code deliverable
console.log('Test 1: Parse code deliverable');
const codeMessage = `
Here's my implementation:

[DELIVERABLE:code:LoginForm.tsx]
export function LoginForm() {
  return <form>Login</form>;
}
[/DELIVERABLE]
`;
const deliverable1 = parseDeliverable(codeMessage, 'leo', 'mission-123');
console.log('Result:', deliverable1 ? '✓ PASS' : '✗ FAIL');
console.log('  Type:', deliverable1?.type, '(expected: code)');
console.log('  Title:', deliverable1?.title, '(expected: LoginForm.tsx)');
console.log();

// Test 2: Parse plan deliverable
console.log('Test 2: Parse plan deliverable');
const planMessage = `
[DELIVERABLE:plan:Project Roadmap]
# Phase 1
- Task 1
- Task 2
[/DELIVERABLE]
`;
const deliverable2 = parseDeliverable(planMessage, 'momo', 'mission-123');
console.log('Result:', deliverable2 ? '✓ PASS' : '✗ FAIL');
console.log('  Type:', deliverable2?.type, '(expected: plan)');
console.log();

// Test 3: Detect collaboration (question)
console.log('Test 3: Detect collaboration (question)');
const collabMessage1 = '@MOMO, what do you think about this approach?';
const collab1 = detectCollaboration(collabMessage1, 'leo');
console.log('Result:', collab1 ? '✓ PASS' : '✗ FAIL');
console.log('  From:', collab1?.fromAgentId, '→ To:', collab1?.toAgentId);
console.log('  Type:', collab1?.collaborationType, '(expected: question)');
console.log();

// Test 4: Detect collaboration (approval)
console.log('Test 4: Detect collaboration (approval)');
const collabMessage2 = 'ALEX, I approve your test plan';
const collab2 = detectCollaboration(collabMessage2, 'momo');
console.log('Result:', collab2 ? '✓ PASS' : '✗ FAIL');
console.log('  From:', collab2?.fromAgentId, '→ To:', collab2?.toAgentId);
console.log('  Type:', collab2?.collaborationType, '(expected: approval)');
console.log();

// Test 5: Parse user prompt request
console.log('Test 5: Parse user prompt request');
const promptMessage = `
I need some input:
[USER_PROMPT]Should I use TypeScript or JavaScript?[/USER_PROMPT]
`;
const userPrompt = parseUserPromptRequest(promptMessage, 'leo');
console.log('Result:', userPrompt ? '✓ PASS' : '✗ FAIL');
console.log('  Question:', userPrompt?.question);
console.log('  Requires response:', userPrompt?.requiresResponse);
console.log();

// Test 6: No deliverable in message
console.log('Test 6: No deliverable in message');
const normalMessage = 'I am analyzing the requirements...';
const deliverable3 = parseDeliverable(normalMessage, 'alex', 'mission-123');
console.log('Result:', deliverable3 === null ? '✓ PASS' : '✗ FAIL');
console.log();

// Test 7: No collaboration in message
console.log('Test 7: No collaboration in message');
const normalMessage2 = 'Working on the implementation now';
const collab3 = detectCollaboration(normalMessage2, 'leo');
console.log('Result:', collab3 === null ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('=== All Tests Complete ===');
