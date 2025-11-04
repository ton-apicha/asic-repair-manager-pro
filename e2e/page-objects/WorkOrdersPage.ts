/**
 * Work Orders Page Object Model
 */

import { Page, Locator } from '@playwright/test';

export class WorkOrdersPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly priorityFilter: Locator;
  readonly dataGrid: Locator;
  readonly createDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByRole('button', { name: /สร้างใบงาน|create work order/i });
    this.searchInput = page.locator('input[type="search"]').or(page.getByPlaceholder(/search|ค้นหา/i));
    this.statusFilter = page.locator('select').filter({ hasText: /status|สถานะ/i }).first();
    this.priorityFilter = page.locator('select').filter({ hasText: /priority|ความสำคัญ/i }).first();
    this.dataGrid = page.locator('[role="grid"]').or(page.locator('.MuiDataGrid-root'));
    this.createDialog = page.locator('[role="dialog"]').filter({ hasText: /สร้างใบงาน|create work order/i });
  }

  /**
   * Navigate to work orders page
   */
  async goto(baseURL?: string): Promise<void> {
    const url = baseURL || 'http://localhost';
    await this.page.goto(`${url}/work-orders`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click create work order button
   */
  async clickCreate(): Promise<void> {
    await this.createButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Search work orders
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Wait for debounce
  }

  /**
   * Filter by status
   */
  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.page.waitForTimeout(500);
  }

  /**
   * Filter by priority
   */
  async filterByPriority(priority: string): Promise<void> {
    await this.priorityFilter.selectOption(priority);
    await this.page.waitForTimeout(500);
  }

  /**
   * Get work order row by WO ID
   */
  async getWorkOrderRow(woId: string): Promise<Locator> {
    return this.dataGrid.locator(`text=${woId}`).locator('..').locator('..');
  }

  /**
   * Click on work order row to navigate to detail
   */
  async clickWorkOrder(woId: string): Promise<void> {
    const row = await this.getWorkOrderRow(woId);
    await row.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if work order exists in grid
   */
  async hasWorkOrder(woId: string): Promise<boolean> {
    try {
      const row = await this.getWorkOrderRow(woId);
      await row.waitFor({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

