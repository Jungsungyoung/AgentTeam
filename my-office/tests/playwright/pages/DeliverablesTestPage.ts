import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for /deliverables-test page
 * Test page for deliverables UI components
 */
export class DeliverablesTestPage {
  readonly page: Page;

  // Deliverables components
  readonly deliverableCards: Locator;
  readonly deliverablesList: Locator;
  readonly deliverableViewer: Locator;

  // Filters
  readonly filterAll: Locator;
  readonly filterCode: Locator;
  readonly filterDocument: Locator;
  readonly filterAnalysis: Locator;
  readonly filterPlan: Locator;

  // Card actions
  readonly viewButtons: Locator;
  readonly downloadButtons: Locator;

  // Viewer elements
  readonly viewerTitle: Locator;
  readonly viewerContent: Locator;
  readonly syntaxHighlight: Locator;
  readonly markdownContent: Locator;
  readonly closeViewerButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Deliverables components
    this.deliverableCards = page.locator('[data-testid="deliverable-card"]');
    this.deliverablesList = page.locator('[data-testid="deliverables-list"]');
    this.deliverableViewer = page.locator('[data-testid="deliverable-viewer"]');

    // Filters
    this.filterAll = page.locator('button:has-text("All"), button:has-text("전체")');
    this.filterCode = page.locator('button:has-text("Code"), button:has-text("코드")');
    this.filterDocument = page.locator('button:has-text("Document"), button:has-text("문서")');
    this.filterAnalysis = page.locator('button:has-text("Analysis"), button:has-text("분석")');
    this.filterPlan = page.locator('button:has-text("Plan"), button:has-text("계획")');

    // Card actions
    this.viewButtons = page.locator('button:has-text("View"), button:has-text("보기")');
    this.downloadButtons = page.locator('button:has-text("Download"), button:has-text("다운로드")');

    // Viewer elements
    this.viewerTitle = page.locator('[data-testid="viewer-title"], h2, h3').first();
    this.viewerContent = page.locator('[data-testid="viewer-content"], pre, code, [class*="content"]');
    this.syntaxHighlight = page.locator('pre code[class*="language-"], [class*="syntax-highlighter"]');
    this.markdownContent = page.locator('[class*="markdown"], [class*="prose"]');
    this.closeViewerButton = page.locator('button:has-text("Close"), button:has-text("닫기"), [aria-label="Close"]');
  }

  async goto() {
    await this.page.goto('/deliverables-test');
    await this.page.waitForLoadState('networkidle');
  }

  async filterByType(type: 'All' | 'Code' | 'Document' | 'Analysis' | 'Plan') {
    const filterMap = {
      All: this.filterAll,
      Code: this.filterCode,
      Document: this.filterDocument,
      Analysis: this.filterAnalysis,
      Plan: this.filterPlan,
    };

    await filterMap[type].click();
    await this.page.waitForTimeout(300);
  }

  async openDeliverable(index: number) {
    await this.viewButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async closeDeliverable() {
    await this.closeViewerButton.click();
    await this.page.waitForTimeout(300);
  }

  async downloadDeliverable(index: number) {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadButtons.nth(index).click();
    const download = await downloadPromise;
    return download;
  }

  async getVisibleCardCount(): Promise<number> {
    await this.page.waitForTimeout(300);
    return await this.deliverableCards.count();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    });
  }
}
