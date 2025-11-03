/**
 * Authentication E2E Tests
 * Tests for login, logout, and protected routes
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { apiClient, ApiClient } from '../helpers/api-client';
import { generateTestUserEmail } from '../fixtures/users';

test.describe('Authentication', () => {
  let testUser: { email: string; password: string };
  let userApiClient: ApiClient;

  test.beforeAll(async () => {
    // Create test user through API
    const email = generateTestUserEmail('user');
    const password = 'TestUser123!';

    try {
      await apiClient.register({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
      });
      testUser = { email, password };
      userApiClient = new ApiClient();
    } catch (error: any) {
      // User might already exist, try to login
      try {
        await apiClient.login(email, password);
        testUser = { email, password };
        userApiClient = new ApiClient();
      } catch {
        throw new Error(`Failed to setup test user: ${error.message}`);
      }
    }
  });

  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Check if login form elements are visible
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('invalid@email.com', 'wrongpassword');
    
    // Wait for error message
    const hasError = await loginPage.hasError();
    expect(hasError).toBe(true);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Verify we're on dashboard
    const isLoggedIn = await dashboardPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should persist login state after page reload', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await page.waitForURL('/dashboard');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be logged in
    const isLoggedIn = await dashboardPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login first
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await page.waitForURL('/dashboard');

    // Find and click logout button
    // Logout button might be in user menu
    const userMenu = page.locator('[aria-label*="user"]').or(page.locator('button:has-text("Logout")'));
    
    // Try to find user menu button
    const userMenuButton = page.locator('button').filter({ hasText: /user|profile|account/i }).first();
    
    if (await userMenuButton.isVisible({ timeout: 2000 })) {
      await userMenuButton.click();
      // Wait for menu to appear
      await page.waitForTimeout(500);
      
      // Click logout option
      const logoutButton = page.getByRole('menuitem', { name: /logout|sign out|ออกจากระบบ/i });
      await logoutButton.click();
    } else {
      // Direct logout button
      const logoutBtn = page.getByRole('button', { name: /logout|sign out|ออกจากระบบ/i });
      await logoutBtn.click();
    }

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('should protect routes when not authenticated', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/work-orders',
      '/customers',
      '/devices',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL('/login', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    }
  });
});

