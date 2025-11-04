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
  async goto(baseURL?: string): Promise<void> {
    const url = baseURL || 'http://localhost';
    await this.page.goto(`${url}/dashboard`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is logged in (dashboard is visible)
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check multiple indicators that dashboard is loaded
      const checks = [
        this.page.waitForURL(/\/dashboard/, { timeout: 5000 }).catch(() => false),
        this.navigationMenu.waitFor({ timeout: 5000, state: 'visible' }).catch(() => false),
        this.page.locator('h1, h2, h3, h4, h5, h6').first().waitFor({ timeout: 5000 }).catch(() => false),
      ];
      
      const results = await Promise.all(checks);
      // At least one should pass
      return results.some(result => result !== false);
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

