import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for /office page
 * My Office - AI Agent Collaboration Interface
 */
export class OfficePage {
  readonly page: Page;

  // Main sections
  readonly officeLayout: Locator;
  readonly managerOffice: Locator;
  readonly workZone: Locator;
  readonly meetingRoom: Locator;
  readonly lounge: Locator;

  // Mission input
  readonly missionInput: Locator;
  readonly submitMissionButton: Locator;
  readonly simulationModeRadio: Locator;
  readonly hybridModeRadio: Locator;
  readonly realModeRadio: Locator;

  // Agents
  readonly agentLeo: Locator;
  readonly agentMomo: Locator;
  readonly agentAlex: Locator;

  // Chat panel
  readonly chatPanel: Locator;
  readonly chatInput: Locator;
  readonly chatSendButton: Locator;
  readonly agentSelector: Locator;
  readonly chatMessages: Locator;

  // Deliverables panel
  readonly deliverablesPanel: Locator;
  readonly deliverableCards: Locator;
  readonly deliverableViewer: Locator;

  // Conversation timeline
  readonly conversationTimeline: Locator;
  readonly collaborationEvents: Locator;

  // Terminal log
  readonly terminalLog: Locator;
  readonly logMessages: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main sections
    this.officeLayout = page.locator('[data-testid="office-layout"]');
    this.managerOffice = page.locator('[data-testid="manager-office"]');
    this.workZone = page.locator('[data-testid="work-zone"]');
    this.meetingRoom = page.locator('[data-testid="meeting-room"]');
    this.lounge = page.locator('[data-testid="lounge"]');

    // Mission input
    this.missionInput = page.locator('[data-testid="mission-input"]');
    this.submitMissionButton = page.locator('[data-testid="execute-mission-button"]');
    this.simulationModeRadio = page.locator('input[type="radio"][value="simulation"]');
    this.hybridModeRadio = page.locator('input[type="radio"][value="hybrid"]');
    this.realModeRadio = page.locator('input[type="radio"][value="real"]');

    // Agents
    this.agentLeo = page.locator('[data-agent="leo"], [data-agent-id="leo"]');
    this.agentMomo = page.locator('[data-agent="momo"], [data-agent-id="momo"]');
    this.agentAlex = page.locator('[data-agent="alex"], [data-agent-id="alex"]');

    // Chat panel
    this.chatPanel = page.locator('[data-testid="chat-panel"], [class*="chat"]').first();
    this.chatInput = page.locator('textarea[placeholder*="message" i], textarea[placeholder*="메시지" i], input[placeholder*="chat" i]');
    this.chatSendButton = page.locator('button:has-text("Send"), button:has-text("전송")');
    this.agentSelector = page.locator('select:has(option:has-text("LEO")), [data-testid="agent-selector"]');
    this.chatMessages = page.locator('[data-testid="chat-message"], [class*="message"]');

    // Deliverables panel
    this.deliverablesPanel = page.locator('[data-testid="deliverables-panel"], [class*="deliverable"]').first();
    this.deliverableCards = page.locator('[data-testid="deliverable-card"], [class*="DeliverableCard"]');
    this.deliverableViewer = page.locator('[data-testid="deliverable-viewer"]');

    // Conversation timeline
    this.conversationTimeline = page.locator('[data-testid="conversation-timeline"], [class*="ConversationTimeline"]');
    this.collaborationEvents = page.locator('[data-testid="collaboration-event"], [class*="collaboration"]');

    // Terminal log
    this.terminalLog = page.locator('[data-testid="terminal-log"], [class*="terminal"]');
    this.logMessages = page.locator('[data-testid="log-message"], [class*="log-entry"]');
  }

  async goto() {
    await this.page.goto('/office');
    await this.page.waitForLoadState('networkidle');
  }

  async submitMission(missionText: string, mode: 'simulation' | 'hybrid' | 'real' = 'simulation') {
    // Select execution mode (radio buttons)
    const modeRadio = mode === 'simulation'
      ? this.simulationModeRadio
      : mode === 'hybrid'
      ? this.hybridModeRadio
      : this.realModeRadio;

    if (await modeRadio.isVisible()) {
      await modeRadio.check();
    }

    // Fill mission input
    await this.missionInput.fill(missionText);

    // Submit
    await this.submitMissionButton.click();

    // Wait for processing to start
    await this.page.waitForTimeout(500);
  }

  async chatWithAgent(agentId: 'LEO' | 'MOMO' | 'ALEX', message: string) {
    // Select agent
    if (await this.agentSelector.isVisible()) {
      await this.agentSelector.selectOption({ label: agentId });
    }

    // Type message
    await this.chatInput.fill(message);

    // Send
    await this.chatSendButton.click();

    // Wait for response
    await this.page.waitForTimeout(1000);
  }

  async waitForMissionComplete(timeout = 30000) {
    // Wait for mission complete log or status
    await expect(this.logMessages.filter({ hasText: /complete|완료/i })).toBeVisible({ timeout });
  }

  async getDeliverableCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    return await this.deliverableCards.count();
  }

  async getCollaborationEventCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    return await this.collaborationEvents.count();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    });
  }
}
