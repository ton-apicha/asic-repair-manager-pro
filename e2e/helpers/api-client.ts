/**
 * API Client for E2E Tests
 * Helper functions for making API requests during testing
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
  };
}

export class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * Login and get access token
   */
  async login(email: string, password: string): Promise<string> {
    const response = await this.client.post<ApiResponse<{ accessToken: string; refreshToken: string; user: any }>>(
      '/auth/login',
      { email, password }
    );

    if (response.data.success && response.data.data?.accessToken) {
      this.accessToken = response.data.data.accessToken;
      return this.accessToken;
    }

    throw new Error(`Login failed: ${response.data.error?.message || 'Unknown error'}`);
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<any> {
    const response = await this.client.post<ApiResponse<{ user: any }>>('/auth/register', userData);

    if (response.data.success && response.data.data?.user) {
      return response.data.data.user;
    }

    throw new Error(`Registration failed: ${response.data.error?.message || 'Unknown error'}`);
  }

  /**
   * Create a customer
   */
  async createCustomer(customerData: {
    companyName: string;
    email: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
    taxId?: string;
  }): Promise<any> {
    const response = await this.client.post<ApiResponse<{ customer: any }>>('/customers', customerData);

    if (response.data.success && response.data.data?.customer) {
      return response.data.data.customer;
    }

    throw new Error(`Customer creation failed: ${response.data.error?.message || 'Unknown error'}`);
  }

  /**
   * Quick create customer (minimal data)
   */
  async quickCreateCustomer(customerData: {
    companyName: string;
    email: string;
    contactPerson: string;
    phone: string;
    address?: string;
    taxId?: string;
  }): Promise<any> {
    const response = await this.client.post<ApiResponse<{ customer: any }>>('/customers/quick-create', customerData);

    if (response.data.success && response.data.data?.customer) {
      return response.data.data.customer;
    }

    throw new Error(`Quick customer creation failed: ${response.data.error?.message || 'Unknown error'}`);
  }

  /**
   * Create a device
   */
  async createDevice(deviceData: {
    customerId: string;
    model: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
  }): Promise<any> {
    const response = await this.client.post<ApiResponse<{ device: any }>>('/devices', deviceData);

    if (response.data.success && response.data.data?.device) {
      return response.data.data.device;
    }

    throw new Error(`Device creation failed: ${response.data.error?.message || 'Unknown error'}`);
  }

  /**
   * Quick create device (minimal data)
   */
  async quickCreateDevice(deviceData: {
    customerId: string;
    model: string;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
  }): Promise<any> {
    const response = await this.client.post<ApiResponse<{ device: any }>>('/devices/quick-create', deviceData);

    if (response.data.success && response.data.data?.device) {
      return response.data.data.device;
    }

    throw new Error(`Quick device creation failed: ${response.data.error?.message || 'Unknown error'}`);
  }

  /**
   * Create a work order
   */
  async createWorkOrder(workOrderData: {
    customerId: string;
    deviceId: string;
    description: string;
    priority?: string;
  }): Promise<any> {
    const response = await this.client.post<ApiResponse<{ workOrder: any }>>('/work-orders', workOrderData);

    if (response.data.success && response.data.data?.workOrder) {
      return response.data.data.workOrder;
    }

    throw new Error(`Work order creation failed: ${response.data.error?.message || 'Unknown error'}`);
  }

  /**
   * Get work order by ID
   */
  async getWorkOrder(workOrderId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<{ workOrder: any }>>(`/work-orders/${workOrderId}`);

    if (response.data.success && response.data.data?.workOrder) {
      return response.data.data.workOrder;
    }

    throw new Error(`Get work order failed: ${response.data.error?.message || 'Unknown error'}`);
  }

  /**
   * Delete a resource (for cleanup)
   */
  async delete(resource: string, id: string): Promise<void> {
    await this.client.delete(`/${resource}/${id}`);
  }
}

export const apiClient = new ApiClient();
