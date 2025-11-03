/**
 * Login Page Object Model
 * Abstraction for login page interactions
 */

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i).or(page.locator('input[name="email"]'));
    this.passwordInput = page.getByLabel(/password/i).or(page.locator('input[name="password"]'));
    this.loginButton = page.getByRole('button', { name: /sign in|login|เข้าสู่ระบบ/i });
    this.errorAlert = page.locator('[role="alert"]').filter({ hasText: /error|failed/i });
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Wait for navigation or error
    await this.page.waitForTimeout(1000);
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    try {
      await this.errorAlert.waitFor({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string | null> {
    try {
      return await this.errorAlert.textContent();
    } catch {
      return null;
    }
  }
}

