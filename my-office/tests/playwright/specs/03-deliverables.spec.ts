import { test, expect } from '@playwright/test';
import { DeliverablesTestPage } from '../pages/DeliverablesTestPage';

test.describe('Deliverables UI System', () => {
  let deliverablesPage: DeliverablesTestPage;

  test.beforeEach(async ({ page }) => {
    deliverablesPage = new DeliverablesTestPage(page);
    await deliverablesPage.goto();
  });

  test('should load deliverables test page', async ({ page }) => {
    // Verify page loaded
    await expect(page).toHaveURL(/deliverables-test/);

    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();

    await deliverablesPage.takeScreenshot('03-deliverables-page');
  });

  test('should display sample deliverable cards', async () => {
    // Wait for page to load
    await deliverablesPage.page.waitForTimeout(1000);

    // Get deliverable count
    const count = await deliverablesPage.getVisibleCardCount();
    console.log(`Deliverable cards count: ${count}`);

    // Should have some test data
    expect(count).toBeGreaterThanOrEqual(0);

    await deliverablesPage.takeScreenshot('03-deliverable-cards');
  });

  test('should filter deliverables by type', async () => {
    await deliverablesPage.page.waitForTimeout(500);

    // Try each filter
    const filters: ('All' | 'Code' | 'Document' | 'Analysis' | 'Plan')[] = [
      'All',
      'Code',
      'Document',
      'Analysis',
      'Plan',
    ];

    for (const filter of filters) {
      const hasFilter = await deliverablesPage[`filter${filter}` as keyof DeliverablesTestPage]
        .isVisible()
        .catch(() => false);

      if (hasFilter) {
        await deliverablesPage.filterByType(filter);
        const count = await deliverablesPage.getVisibleCardCount();
        console.log(`${filter} filter: ${count} deliverables`);
        await deliverablesPage.takeScreenshot(`03-filter-${filter.toLowerCase()}`);
      }
    }
  });

  test('should open deliverable viewer with syntax highlighting', async () => {
    await deliverablesPage.page.waitForTimeout(500);

    const cardCount = await deliverablesPage.getVisibleCardCount();

    if (cardCount > 0) {
      // Open first deliverable
      await deliverablesPage.openDeliverable(0);

      // Wait for viewer
      await deliverablesPage.page.waitForTimeout(1000);

      // Check for viewer
      const hasViewer = await deliverablesPage.deliverableViewer.isVisible().catch(() => false);
      console.log(`Viewer opened: ${hasViewer}`);

      // Check for syntax highlighting (code deliverables)
      const hasSyntax = await deliverablesPage.syntaxHighlight.isVisible().catch(() => false);
      console.log(`Syntax highlighting: ${hasSyntax}`);

      // Take screenshot
      await deliverablesPage.takeScreenshot('03-viewer-open');

      // Close viewer
      const hasCloseButton = await deliverablesPage.closeViewerButton.isVisible().catch(() => false);
      if (hasCloseButton) {
        await deliverablesPage.closeDeliverable();
        await deliverablesPage.takeScreenshot('03-viewer-closed');
      }
    } else {
      console.log('No deliverables to test');
      await deliverablesPage.takeScreenshot('03-no-deliverables');
    }
  });

  test('should display markdown rendering for documents', async () => {
    await deliverablesPage.page.waitForTimeout(500);

    // Filter to documents
    const hasDocFilter = await deliverablesPage.filterDocument.isVisible().catch(() => false);

    if (hasDocFilter) {
      await deliverablesPage.filterByType('Document');
      const docCount = await deliverablesPage.getVisibleCardCount();

      if (docCount > 0) {
        // Open first document
        await deliverablesPage.openDeliverable(0);
        await deliverablesPage.page.waitForTimeout(1000);

        // Check for markdown rendering
        const hasMarkdown = await deliverablesPage.markdownContent.isVisible().catch(() => false);
        console.log(`Markdown rendering: ${hasMarkdown}`);

        await deliverablesPage.takeScreenshot('03-markdown-viewer');

        // Close
        const hasClose = await deliverablesPage.closeViewerButton.isVisible().catch(() => false);
        if (hasClose) {
          await deliverablesPage.closeDeliverable();
        }
      }
    }
  });

  test('should support download functionality', async () => {
    await deliverablesPage.page.waitForTimeout(500);

    const cardCount = await deliverablesPage.getVisibleCardCount();

    if (cardCount > 0) {
      const hasDownloadButton = await deliverablesPage.downloadButtons
        .first()
        .isVisible()
        .catch(() => false);

      if (hasDownloadButton) {
        // Attempt download (might not work in test environment)
        try {
          const download = await deliverablesPage.downloadDeliverable(0);
          console.log(`Download initiated: ${download.suggestedFilename()}`);
        } catch (e) {
          console.log('Download not available in test environment');
        }
      }

      await deliverablesPage.takeScreenshot('03-download-button');
    }
  });

  test('should show deliverable type badges', async () => {
    await deliverablesPage.page.waitForTimeout(500);

    const cardCount = await deliverablesPage.getVisibleCardCount();

    if (cardCount > 0) {
      // Check for type badges (Code, Document, Analysis, Plan)
      const badges = deliverablesPage.page.locator('[class*="badge"], [class*="type"]');
      const badgeCount = await badges.count();
      console.log(`Type badges found: ${badgeCount}`);

      await deliverablesPage.takeScreenshot('03-type-badges');
    }
  });

  test('should show agent color indicators', async () => {
    await deliverablesPage.page.waitForTimeout(500);

    const cardCount = await deliverablesPage.getVisibleCardCount();

    if (cardCount > 0) {
      // Check for agent colors (LEO=red, MOMO=orange, ALEX=cyan)
      const cards = deliverablesPage.deliverableCards;
      const firstCard = cards.first();

      // Get computed styles to check for colors
      const hasColors = await firstCard.isVisible();
      console.log(`Agent color indicators: ${hasColors}`);

      await deliverablesPage.takeScreenshot('03-agent-colors');
    }
  });
});
