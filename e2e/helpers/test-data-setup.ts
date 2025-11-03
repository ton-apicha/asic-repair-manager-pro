/**
 * Test Data Setup Helper
 * Functions for creating test data through API
 */

import { apiClient } from './api-client';
import { TestUser, generateTestUserEmail } from '../fixtures/users';

export interface TestData {
  adminUser: any;
  userUser: any;
  adminToken: string;
  userToken: string;
  customers: any[];
  devices: any[];
  workOrders: any[];
}

/**
 * Setup test data: users, customers, devices, work orders
 */
export async function setupTestData(): Promise<TestData> {
  const testData: TestData = {
    adminUser: null,
    userUser: null,
    adminToken: '',
    userToken: '',
    customers: [],
    devices: [],
    workOrders: [],
  };

  try {
    // 1. Register and login admin user
    console.log('Setting up admin user...');
    const adminEmail = generateTestUserEmail('admin');
    const adminPassword = 'TestAdmin123!';
    
    testData.adminUser = await apiClient.register({
      email: adminEmail,
      password: adminPassword,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN',
    });

    testData.adminToken = await apiClient.login(adminEmail, adminPassword);
    apiClient.setAccessToken(testData.adminToken);

    // 2. Register and login regular user
    console.log('Setting up regular user...');
    const userEmail = generateTestUserEmail('user');
    const userPassword = 'TestUser123!';
    
    testData.userUser = await apiClient.register({
      email: userEmail,
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    });

    testData.userToken = await apiClient.login(userEmail, userPassword);

    // 3. Create test customers (using admin token)
    console.log('Creating test customers...');
    apiClient.setAccessToken(testData.adminToken);

    const customer1 = await apiClient.quickCreateCustomer({
      companyName: `TEST_Customer_${Date.now()}`,
      email: `test.customer.${Date.now()}@test.com`,
      contactPerson: 'Test Contact Person',
      phone: '0812345678',
      address: '123 Test Street, Test City',
    });

    const customer2 = await apiClient.quickCreateCustomer({
      companyName: `TEST_Customer_2_${Date.now()}`,
      email: `test.customer2.${Date.now()}@test.com`,
      contactPerson: 'Test Contact Person 2',
      phone: '0823456789',
    });

    testData.customers = [customer1, customer2];

    // 4. Create test devices
    console.log('Creating test devices...');
    const device1 = await apiClient.quickCreateDevice({
      customerId: customer1.id,
      model: `TEST_ASIC_${Date.now()}`,
      serialNumber: `TEST_SN_${Date.now()}`,
    });

    const device2 = await apiClient.quickCreateDevice({
      customerId: customer1.id,
      model: `TEST_ASIC_2_${Date.now()}`,
      serialNumber: `TEST_SN_2_${Date.now()}`,
    });

    const device3 = await apiClient.quickCreateDevice({
      customerId: customer2.id,
      model: `TEST_ASIC_3_${Date.now()}`,
    });

    testData.devices = [device1, device2, device3];

    // 5. Create test work orders
    console.log('Creating test work orders...');
    const wo1 = await apiClient.createWorkOrder({
      customerId: customer1.id,
      deviceId: device1.id,
      description: 'Test work order description - Device not working',
      priority: 'HIGH',
    });

    const wo2 = await apiClient.createWorkOrder({
      customerId: customer1.id,
      deviceId: device2.id,
      description: 'Test work order description 2 - Routine maintenance',
      priority: 'MEDIUM',
    });

    testData.workOrders = [wo1, wo2];

    console.log('Test data setup completed successfully!');
    return testData;
  } catch (error: any) {
    console.error('Test data setup failed:', error.message);
    throw error;
  }
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(testData: TestData): Promise<void> {
  try {
    apiClient.setAccessToken(testData.adminToken);

    // Cleanup work orders
    for (const wo of testData.workOrders) {
      try {
        await apiClient.delete('work-orders', wo.id);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    // Cleanup devices
    for (const device of testData.devices) {
      try {
        await apiClient.delete('devices', device.id);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    // Cleanup customers
    for (const customer of testData.customers) {
      try {
        await apiClient.delete('customers', customer.id);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    console.log('Test data cleanup completed');
  } catch (error: any) {
    console.error('Test data cleanup failed:', error.message);
    // Don't throw - cleanup failures shouldn't fail tests
  }
}

/**
 * Get or create test user (for tests that need existing user)
 */
export async function getOrCreateTestUser(role: 'ADMIN' | 'USER'): Promise<{ user: any; token: string }> {
  const email = generateTestUserEmail(role.toLowerCase() as 'admin' | 'user');
  const password = 'TestUser123!';

  try {
    // Try to login first
    const token = await apiClient.login(email, password);
    const user = { email, role };
    return { user, token };
  } catch (error) {
    // User doesn't exist, create it
    const user = await apiClient.register({
      email,
      password,
      firstName: 'Test',
      lastName: role,
      role,
    });

    const token = await apiClient.login(email, password);
    return { user, token };
  }
}

