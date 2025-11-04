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
    this.passwordInput = page.locator('input[name="password"]').first(); // Use first() to avoid strict mode violation
    this.loginButton = page.getByRole('button', { name: /sign in|login|เข้าสู่ระบบ/i });
    this.errorAlert = page.locator('[role="alert"]').filter({ hasText: /error|failed/i });
  }

  /**
   * Navigate to login page
   */
  async goto(baseURL?: string): Promise<void> {
    const url = baseURL || 'http://localhost';
    await this.page.goto(`${url}/login`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Wait for button to be enabled and click
    await this.loginButton.waitFor({ state: 'visible' });
    
    // Click and wait for either success or error response
    const [response] = await Promise.all([
      this.page.waitForResponse(
        response => response.url().includes('/auth/login'),
        { timeout: 10000 }
      ).catch(() => null),
      this.loginButton.click(),
    ]);
    
    // Wait a bit for UI to update
    await this.page.waitForTimeout(1000);
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    try {
      // Try multiple selectors for error messages
      const errorSelectors = [
        '[role="alert"]',
        '.MuiAlert-root',
        '.MuiSnackbar-root',
        '[class*="error"]',
        '[class*="Error"]',
      ];
      
      for (const selector of errorSelectors) {
        try {
          const errorElement = this.page.locator(selector).filter({ hasText: /error|failed|invalid|credentials/i });
          await errorElement.waitFor({ timeout: 3000, state: 'visible' });
          return true;
        } catch {
          // Continue to next selector
        }
      }
      
      return false;
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

