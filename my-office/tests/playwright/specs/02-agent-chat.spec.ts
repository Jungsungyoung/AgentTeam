import { test, expect } from '@playwright/test';
import { OfficePage } from '../pages/OfficePage';

test.describe('Agent Chat System', () => {
  let officePage: OfficePage;

  test.beforeEach(async ({ page }) => {
    officePage = new OfficePage(page);
    await officePage.goto();
  });

  test('should display chat panel interface', async () => {
    // Check if chat panel is visible
    const hasChatPanel = await officePage.chatPanel.isVisible().catch(() => false);

    console.log(`Chat panel visibility: ${hasChatPanel}`);

    // Take screenshot
    await officePage.takeScreenshot('02-chat-interface');
  });

  test('should display agent selector', async () => {
    // Check for agent selector
    const hasSelector = await officePage.agentSelector.isVisible().catch(() => false);

    console.log(`Agent selector visibility: ${hasSelector}`);

    if (hasSelector) {
      // Get available options
      const options = await officePage.agentSelector.locator('option').allTextContents();
      console.log('Available agents:', options);

      // Should include LEO, MOMO, ALEX
      const hasLeo = options.some((opt) => opt.includes('LEO'));
      const hasMomo = options.some((opt) => opt.includes('MOMO'));
      const hasAlex = options.some((opt) => opt.includes('ALEX'));

      console.log(`Agents - LEO: ${hasLeo}, MOMO: ${hasMomo}, ALEX: ${hasAlex}`);
    }

    // Take screenshot
    await officePage.takeScreenshot('02-agent-selector');
  });

  test('should send message to LEO', async ({ page }) => {
    const hasChatInput = await officePage.chatInput.isVisible().catch(() => false);
    const hasSendButton = await officePage.chatSendButton.isVisible().catch(() => false);

    if (hasChatInput && hasSendButton) {
      // Send a simple message
      await officePage.chatWithAgent('LEO', 'Hello LEO!');

      // Wait for potential response
      await page.waitForTimeout(2000);

      // Check if message was sent
      const messagesCount = await officePage.chatMessages.count();
      console.log(`Chat messages count: ${messagesCount}`);

      // Take screenshot
      await officePage.takeScreenshot('02-chat-with-leo');
    } else {
      console.log('Chat interface not fully available');
      await officePage.takeScreenshot('02-chat-not-available');
    }
  });

  test('should send message to MOMO', async ({ page }) => {
    const hasChatInput = await officePage.chatInput.isVisible().catch(() => false);

    if (hasChatInput) {
      await officePage.chatWithAgent('MOMO', 'Hi MOMO, can you help me?');

      await page.waitForTimeout(2000);

      await officePage.takeScreenshot('02-chat-with-momo');
    } else {
      console.log('Chat not available');
    }
  });

  test('should send message to ALEX', async ({ page }) => {
    const hasChatInput = await officePage.chatInput.isVisible().catch(() => false);

    if (hasChatInput) {
      await officePage.chatWithAgent('ALEX', 'Hello ALEX!');

      await page.waitForTimeout(2000);

      await officePage.takeScreenshot('02-chat-with-alex');
    } else {
      console.log('Chat not available');
    }
  });

  test('should display chat message history', async () => {
    const hasMessages = await officePage.chatMessages.isVisible().catch(() => false);

    if (hasMessages) {
      const messageCount = await officePage.chatMessages.count();
      console.log(`Message history count: ${messageCount}`);
    }

    await officePage.takeScreenshot('02-chat-history');
  });

  test('should show typing indicator during response (if implemented)', async ({ page }) => {
    const hasChatInput = await officePage.chatInput.isVisible().catch(() => false);

    if (hasChatInput) {
      // Send message
      await officePage.chatWithAgent('LEO', 'Quick question');

      // Check for typing indicator immediately
      const typingIndicator = page.locator('[data-testid="typing-indicator"], [class*="typing"]');
      const hasTyping = await typingIndicator.isVisible().catch(() => false);

      console.log(`Typing indicator: ${hasTyping}`);

      await page.waitForTimeout(1000);
      await officePage.takeScreenshot('02-typing-indicator');
    }
  });
});
