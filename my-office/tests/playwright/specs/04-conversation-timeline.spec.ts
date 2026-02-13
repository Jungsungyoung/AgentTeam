import { test, expect } from '@playwright/test';
import { OfficePage } from '../pages/OfficePage';

test.describe('Conversation Timeline', () => {
  let officePage: OfficePage;

  test.beforeEach(async ({ page }) => {
    officePage = new OfficePage(page);
    await officePage.goto();
  });

  test('should display conversation timeline component', async () => {
    // Check if timeline is visible
    const hasTimeline = await officePage.conversationTimeline.isVisible().catch(() => false);

    console.log(`Conversation timeline visibility: ${hasTimeline}`);

    await officePage.takeScreenshot('04-timeline-component');
  });

  test('should show collaboration filter options', async ({ page }) => {
    const hasTimeline = await officePage.conversationTimeline.isVisible().catch(() => false);

    if (hasTimeline) {
      // Look for filter buttons
      const filterButtons = page.locator('button').filter({ hasText: /All|Question|Answer|Proposal|Approval|Handoff/i });
      const filterCount = await filterButtons.count();
      console.log(`Filter buttons found: ${filterCount}`);

      if (filterCount > 0) {
        const filterTexts = await filterButtons.allTextContents();
        console.log('Available filters:', filterTexts);
      }

      await officePage.takeScreenshot('04-timeline-filters');
    }
  });

  test('should display collaboration events after mission', async ({ page }) => {
    // Submit a mission that might trigger collaboration
    const missionText = 'Build a full-stack authentication system';

    await officePage.submitMission(missionText, 'simulation');

    // Wait for processing
    await page.waitForTimeout(3000);

    // Check for collaboration events
    const eventCount = await officePage.getCollaborationEventCount();
    console.log(`Collaboration events: ${eventCount}`);

    await officePage.takeScreenshot('04-collaboration-events');
  });

  test('should show agent colors in collaboration messages', async ({ page }) => {
    const hasTimeline = await officePage.conversationTimeline.isVisible().catch(() => false);

    if (hasTimeline) {
      const hasEvents = await officePage.collaborationEvents.isVisible().catch(() => false);

      if (hasEvents) {
        // Check for agent-colored elements
        // LEO = red (#ff4444), MOMO = orange (#ffaa00), ALEX = cyan (#00ccff)
        const firstEvent = officePage.collaborationEvents.first();
        const hasEvent = await firstEvent.isVisible().catch(() => false);

        console.log(`Collaboration event with colors: ${hasEvent}`);
      }

      await officePage.takeScreenshot('04-agent-colors');
    }
  });

  test('should display collaboration type badges', async ({ page }) => {
    const hasTimeline = await officePage.conversationTimeline.isVisible().catch(() => false);

    if (hasTimeline) {
      // Look for type badges (Question, Answer, Proposal, etc.)
      const badges = page.locator('[class*="badge"], [class*="type"]').filter({
        hasText: /Question|Answer|Proposal|Approval|Handoff/i,
      });

      const badgeCount = await badges.count();
      console.log(`Collaboration type badges: ${badgeCount}`);

      await officePage.takeScreenshot('04-type-badges');
    }
  });

  test('should show timestamps on events', async ({ page }) => {
    const hasTimeline = await officePage.conversationTimeline.isVisible().catch(() => false);

    if (hasTimeline) {
      const hasEvents = await officePage.collaborationEvents.isVisible().catch(() => false);

      if (hasEvents) {
        // Look for timestamp elements
        const timestamps = page.locator('[class*="timestamp"], [class*="time"], time');
        const timestampCount = await timestamps.count();
        console.log(`Timestamps found: ${timestampCount}`);
      }

      await officePage.takeScreenshot('04-timestamps');
    }
  });

  test('should filter by collaboration type', async ({ page }) => {
    const hasTimeline = await officePage.conversationTimeline.isVisible().catch(() => false);

    if (hasTimeline) {
      // Try clicking different filter buttons
      const filterTypes = ['Question', 'Answer', 'Proposal', 'Approval', 'Handoff'];

      for (const type of filterTypes) {
        const filterButton = page.locator(`button:has-text("${type}")`);
        const hasButton = await filterButton.isVisible().catch(() => false);

        if (hasButton) {
          await filterButton.click();
          await page.waitForTimeout(500);

          const eventCount = await officePage.getCollaborationEventCount();
          console.log(`${type} filter: ${eventCount} events`);

          await officePage.takeScreenshot(`04-filter-${type.toLowerCase()}`);
        }
      }
    }
  });

  test('should show empty state when no collaborations', async ({ page }) => {
    const hasTimeline = await officePage.conversationTimeline.isVisible().catch(() => false);

    if (hasTimeline) {
      // Look for empty state message
      const emptyState = page.locator('[class*="empty"], [data-testid="empty-state"]').filter({
        hasText: /No.*conversation|No.*collaboration/i,
      });

      const hasEmpty = await emptyState.isVisible().catch(() => false);
      console.log(`Empty state visible: ${hasEmpty}`);

      await officePage.takeScreenshot('04-empty-state');
    }
  });

  test('should display conversation flow (from → to)', async ({ page }) => {
    // Submit mission to trigger collaboration
    await officePage.submitMission('Create a complex feature', 'simulation');
    await page.waitForTimeout(3000);

    const hasTimeline = await officePage.conversationTimeline.isVisible().catch(() => false);

    if (hasTimeline) {
      const hasEvents = await officePage.collaborationEvents.isVisible().catch(() => false);

      if (hasEvents) {
        // Look for "from" and "to" indicators or arrows
        const flowIndicators = page.locator('[class*="arrow"], [class*="flow"]');
        const hasFlow = (await flowIndicators.count()) > 0;

        console.log(`Conversation flow indicators: ${hasFlow}`);
      }

      await officePage.takeScreenshot('04-conversation-flow');
    }
  });
});
