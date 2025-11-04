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

  test.beforeEach(async ({ page, baseURL }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.goto(baseURL || 'http://localhost');
  });

  test('should redirect to login when not authenticated', async ({ page, baseURL }) => {
    const url = baseURL || 'http://localhost';
    await page.goto(`${url}/dashboard`);
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('should display login page correctly', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto(baseURL);

    // Check if login form elements are visible
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto(baseURL);

    await loginPage.login('invalid@email.com', 'wrongpassword');
    
    // Wait for error message
    const hasError = await loginPage.hasError();
    expect(hasError).toBe(true);
  });

  test('should login successfully with valid credentials', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto(baseURL);
    await loginPage.login(testUser.email, testUser.password);

    // Wait for redirect to dashboard (with regex to handle baseURL)
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    // Verify we're on dashboard
    const isLoggedIn = await dashboardPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should persist login state after page reload', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login
    await loginPage.goto(baseURL);
    await loginPage.login(testUser.email, testUser.password);
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be logged in
    const isLoggedIn = await dashboardPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should logout successfully', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login first
    await loginPage.goto(baseURL);
    await loginPage.login(testUser.email, testUser.password);
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Find and click logout button
    // Logout is in user menu accessed via Avatar button
    const avatarButton = page.getByRole('button', { name: /account of current user/i });
    await avatarButton.waitFor({ state: 'visible', timeout: 5000 });
    await avatarButton.click();
    
    // Wait for menu to appear
    await page.waitForTimeout(500);
    
    // Click logout menu item
    const logoutMenuItem = page.getByRole('menuitem', { name: /^logout$/i });
    await logoutMenuItem.waitFor({ state: 'visible', timeout: 2000 });
    await logoutMenuItem.click();

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should protect routes when not authenticated', async ({ page, baseURL }) => {
    const url = baseURL || 'http://localhost';
    const protectedRoutes = [
      '/dashboard',
      '/work-orders',
      '/customers',
      '/devices',
    ];

    for (const route of protectedRoutes) {
      await page.goto(`${url}${route}`);
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain('/login');
    }
  });
});

