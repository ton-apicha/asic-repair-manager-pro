/**
 * Test User Fixtures
 * Credentials and user data for E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
}

export const testUsers: Record<string, TestUser> = {
  admin: {
    email: `test.admin.${Date.now()}@test.com`,
    password: 'TestAdmin123!',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'ADMIN',
  },
  user: {
    email: `test.user.${Date.now()}@test.com`,
    password: 'TestUser123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
  },
};

/**
 * Generate unique test user email
 */
export function generateTestUserEmail(role: 'admin' | 'user'): string {
  return `test.${role}.${Date.now()}.${Math.random().toString(36).substring(7)}@test.com`;
}

