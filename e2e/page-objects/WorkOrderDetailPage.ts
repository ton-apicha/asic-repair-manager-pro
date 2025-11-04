/**
 * Work Order Detail Page Object Model
 */

import { Page, Locator } from '@playwright/test';

export class WorkOrderDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly editButton: Locator;
  readonly woId: Locator;
  readonly statusButton: Locator;
  readonly workflowStepper: Locator;
  readonly editDialog: Locator;
  readonly statusDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: /back|กลับ/i });
    this.editButton = page.getByRole('button', { name: /edit|แก้ไข/i });
    this.woId = page.locator('text=/WO-\\d{8}-\\d{3}/').or(page.locator('text=/\\d{8}\\d{3}/'));
    this.statusButton = page.getByRole('button', { name: /status|สถานะ|เปลี่ยนสถานะ/i });
    this.workflowStepper = page.locator('[role="progressbar"]').or(page.locator('.MuiStepper-root'));
    this.editDialog = page.locator('[role="dialog"]').filter({ hasText: /แก้ไข|edit/i });
    this.statusDialog = page.locator('[role="dialog"]').filter({ hasText: /สถานะ|status/i });
  }

  /**
   * Navigate to work order detail page
   */
  async goto(workOrderId: string, baseURL?: string): Promise<void> {
    const url = baseURL || 'http://localhost';
    await this.page.goto(`${url}/work-orders/${workOrderId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click edit button
   */
  async clickEdit(): Promise<void> {
    await this.editButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click status update button
   */
  async clickStatusUpdate(): Promise<void> {
    await this.statusButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if workflow stepper is visible
   */
  async hasWorkflowStepper(): Promise<boolean> {
    try {
      await this.workflowStepper.waitFor({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current status
   */
  async getCurrentStatus(): Promise<string | null> {
    try {
      const statusChip = this.page.locator('[role="status"]').or(this.page.locator('.MuiChip-root')).first();
      return await statusChip.textContent();
    } catch {
      return null;
    }
  }
}

