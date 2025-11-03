/**
 * Dashboard Page Object Model
 */

import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly navigationMenu: Locator;
  readonly workOrdersLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.getByText(/dashboard|welcome/i);
    this.navigationMenu = page.locator('nav, [role="navigation"]');
    this.workOrdersLink = page.getByRole('link', { name: /work orders|ใบงาน/i });
  }

  /**
   * Navigate to dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is logged in (dashboard is visible)
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.welcomeMessage.waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to work orders page
   */
  async gotoWorkOrders(): Promise<void> {
    await this.workOrdersLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}

