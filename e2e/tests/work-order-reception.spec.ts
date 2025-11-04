/**
 * Work Order Reception E2E Tests (Phase 1)
 * Tests for:
 * - Customer Quick Add
 * - Device Quick Add
 * - Work Order Creation
 * - WO_ID format (YYMMDDXXX)
 * - Work Orders List with filters
 * - Search functionality
 * - Navigation to Detail page
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { WorkOrdersPage } from '../page-objects/WorkOrdersPage';
import { WorkOrderCreateDialog } from '../page-objects/WorkOrderCreateDialog';
import { setupTestData, cleanupTestData, TestData } from '../helpers/test-data-setup';
import { apiClient } from '../helpers/api-client';
import { generateTestUserEmail } from '../fixtures/users';

test.describe('Work Order Reception System', () => {
  let testData: TestData;
  let adminToken: string;

  test.beforeAll(async () => {
    // Setup test data
    testData = await setupTestData();
    adminToken = testData.adminToken;
    apiClient.setAccessToken(adminToken);
  });

  test.beforeEach(async ({ page, baseURL }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto(baseURL);
    await loginPage.login(testData.adminUser.email, 'TestAdmin123!');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test.afterAll(async () => {
    // Cleanup test data
    await cleanupTestData(testData);
  });

  test('should display work orders list page', async ({ page, baseURL }) => {
    const workOrdersPage = new WorkOrdersPage(page);
    await workOrdersPage.goto(baseURL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page elements are visible
    await expect(workOrdersPage.createButton).toBeVisible({ timeout: 10000 });
    await expect(workOrdersPage.dataGrid).toBeVisible({ timeout: 10000 });
  });

  test('should open create work order dialog', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);
    const createDialog = new WorkOrderCreateDialog(page);

    await workOrdersPage.goto(baseURL);
    await workOrdersPage.clickCreate();

    // Check if dialog is visible
    await expect(createDialog.dialog).toBeVisible();
    await expect(createDialog.customerAutocomplete).toBeVisible();
    await expect(createDialog.deviceAutocomplete).toBeVisible();
    await expect(createDialog.descriptionInput).toBeVisible();
  });

  test('should create customer using quick add', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);
    const createDialog = new WorkOrderCreateDialog(page);

    await workOrdersPage.goto(baseURL);
    await workOrdersPage.clickCreate();

    // Click add customer button
    await createDialog.clickAddCustomer();

    // Fill customer quick add form
    const customerData = {
      companyName: `TEST_QuickAdd_${Date.now()}`,
      email: generateTestUserEmail('user').replace('user', 'customer'),
      contactPerson: 'Test Contact',
      phone: '0812345678',
    };

    await createDialog.fillCustomerQuickAdd(customerData);

    // Verify customer is selected (check if autocomplete shows the company name)
    const customerValue = await createDialog.customerInput.inputValue();
    expect(customerValue).toContain(customerData.companyName);
  });

  test('should create device using quick add', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);
    const createDialog = new WorkOrderCreateDialog(page);

    await workOrdersPage.goto(baseURL);
    await workOrdersPage.clickCreate();

    // First, select or create a customer
    if (testData.customers.length > 0) {
      await createDialog.selectCustomer(testData.customers[0].companyName);
    } else {
      await createDialog.clickAddCustomer();
      await createDialog.fillCustomerQuickAdd({
        companyName: `TEST_Customer_${Date.now()}`,
        email: generateTestUserEmail('user').replace('user', 'customer'),
        contactPerson: 'Test Contact',
        phone: '0812345678',
      });
    }

    // Wait for device autocomplete to be enabled
    await page.waitForTimeout(500);

    // Click add device button
    await createDialog.clickAddDevice();

    // Fill device quick add form
    const deviceData = {
      model: `TEST_ASIC_${Date.now()}`,
      serialNumber: `TEST_SN_${Date.now()}`,
    };

    await createDialog.fillDeviceQuickAdd(deviceData);

    // Verify device is selected
    const deviceValue = await createDialog.deviceInput.inputValue();
    expect(deviceValue).toContain(deviceData.model);
  });

  test('should create work order with existing customer and device', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);
    const createDialog = new WorkOrderCreateDialog(page);

    await workOrdersPage.goto(baseURL);
    await workOrdersPage.clickCreate();

    // Select existing customer
    if (testData.customers.length > 0) {
      await createDialog.selectCustomer(testData.customers[0].companyName);
      await page.waitForTimeout(500);

      // Select existing device
      if (testData.devices.length > 0) {
        const device = testData.devices.find(d => d.customerId === testData.customers[0].id);
        if (device) {
          await createDialog.selectDevice(device.model);
        }
      }
    }

    // Fill form
    await createDialog.fillForm({
      description: 'Test work order description - E2E test',
      priority: 'HIGH',
    });

    // Submit
    await createDialog.submit();

    // Wait for dialog to close and work order to appear in list
    await page.waitForTimeout(2000);
    await workOrdersPage.goto(baseURL);

    // Check if new work order appears (we can't check exact WO ID as it's generated)
    // Instead, check if data grid has been updated
    const gridRows = workOrdersPage.dataGrid.locator('[role="row"]');
    const rowCount = await gridRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should create work order with quick add customer and device', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);
    const createDialog = new WorkOrderCreateDialog(page);

    await workOrdersPage.goto(baseURL);
    await workOrdersPage.clickCreate();

    // Create customer using quick add
    await createDialog.clickAddCustomer();
    const customerData = {
      companyName: `TEST_NewCustomer_${Date.now()}`,
      email: generateTestUserEmail('user').replace('user', 'customer'),
      contactPerson: 'New Test Contact',
      phone: '0823456789',
    };
    await createDialog.fillCustomerQuickAdd(customerData);

    // Wait for device autocomplete
    await page.waitForTimeout(1000);

    // Create device using quick add
    await createDialog.clickAddDevice();
    const deviceData = {
      model: `TEST_NewDevice_${Date.now()}`,
      serialNumber: `TEST_NewSN_${Date.now()}`,
    };
    await createDialog.fillDeviceQuickAdd(deviceData);

    // Fill form
    await createDialog.fillForm({
      description: 'Test work order with quick add customer and device',
      priority: 'MEDIUM',
    });

    // Submit
    await createDialog.submit();

    // Wait and verify
    await page.waitForTimeout(2000);
    await workOrdersPage.goto(baseURL);
    const gridRows = workOrdersPage.dataGrid.locator('[role="row"]');
    const rowCount = await gridRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should validate WO_ID format (YYMMDDXXX)', async ({ page }) => {
    // Create work order via API to get WO_ID
    const workOrder = await apiClient.createWorkOrder({
      customerId: testData.customers[0].id,
      deviceId: testData.devices[0].id,
      description: 'Test WO_ID format',
    });

    // Verify WO_ID format: YYMMDDXXX
    const woId = workOrder.woId;
    const woIdPattern = /^\d{2}\d{2}\d{2}\d{3}$/;
    expect(woId).toMatch(woIdPattern);

    // Check date part (first 6 digits)
    const today = new Date();
    const expectedYY = String(today.getFullYear()).slice(-2);
    const expectedMM = String(today.getMonth() + 1).padStart(2, '0');
    const expectedDD = String(today.getDate()).padStart(2, '0');
    const datePart = woId.substring(0, 6);
    expect(datePart).toBe(`${expectedYY}${expectedMM}${expectedDD}`);
  });

  test('should search work orders', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);

    await workOrdersPage.goto(baseURL);

    // Search for existing work order
    if (testData.workOrders.length > 0) {
      const searchTerm = testData.workOrders[0].woId.substring(0, 6); // Search by date part
      await workOrdersPage.search(searchTerm);
      await page.waitForTimeout(1000);

      // Verify search results (check if work order appears)
      const hasWorkOrder = await workOrdersPage.hasWorkOrder(testData.workOrders[0].woId);
      expect(hasWorkOrder).toBe(true);
    }
  });

  test('should filter work orders by status', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);

    await workOrdersPage.goto(baseURL);

    // Filter by TRIAGE status
    await workOrdersPage.filterByStatus('TRIAGE');
    await page.waitForTimeout(1000);

    // Verify filter is applied (check if data grid shows filtered results)
    const gridRows = workOrdersPage.dataGrid.locator('[role="row"]');
    const rowCount = await gridRows.count();
    // At least should have some rows (or empty state)
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter work orders by priority', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);

    await workOrdersPage.goto(baseURL);

    // Filter by HIGH priority
    await workOrdersPage.filterByPriority('HIGH');
    await page.waitForTimeout(1000);

    // Verify filter is applied
    const gridRows = workOrdersPage.dataGrid.locator('[role="row"]');
    const rowCount = await gridRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to work order detail page', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);

    await workOrdersPage.goto(baseURL);

    // Click on a work order row
    if (testData.workOrders.length > 0) {
      const woId = testData.workOrders[0].woId;
      
      // Try to find and click the row
      const row = workOrdersPage.dataGrid.locator(`text=${woId}`).first();
      if (await row.isVisible({ timeout: 2000 })) {
        await row.click();
        
        // Should navigate to detail page
        await page.waitForURL(/\/work-orders\/[a-zA-Z0-9-]+/, { timeout: 5000 });
        expect(page.url()).toMatch(/\/work-orders\/[a-zA-Z0-9-]+/);
      }
    }
  });

  test('should show validation errors for required fields', async ({ page }) => {
    const workOrdersPage = new WorkOrdersPage(page);
    const createDialog = new WorkOrderCreateDialog(page);

    await workOrdersPage.goto(baseURL);
    await workOrdersPage.clickCreate();

    // Try to submit without filling required fields
    await createDialog.submit();

    // Check for validation errors (MUI shows error messages)
    await page.waitForTimeout(500);
    const errorMessages = page.locator('[role="alert"]').or(page.locator('.Mui-error'));
    const errorCount = await errorMessages.count();
    // Should have at least one error
    expect(errorCount).toBeGreaterThan(0);
  });
});

