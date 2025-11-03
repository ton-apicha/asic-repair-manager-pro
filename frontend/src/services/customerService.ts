import { apiClient } from './apiClient';
import { 
  Customer, 
  CustomerCreate, 
  CustomerUpdate,
  CustomerQuickCreate,
  CustomerFilters,
  CustomerStats,
  CustomerDeviceSummary,
  CustomerWorkOrderSummary,
  CustomerContact,
  CustomerContactCreate,
  PaginatedResponse
} from '../types/customer';
import { ApiResponse, PaginationParams } from '../types/common';

export class CustomerService {
  // Customer CRUD
  static async getCustomers(params: PaginationParams & CustomerFilters = {}): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  }

  static async getCustomerById(id: string): Promise<ApiResponse<{ customer: Customer }>> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  }

  static async createCustomer(data: CustomerCreate): Promise<ApiResponse<{ customer: Customer }>> {
    const response = await apiClient.post('/customers', data);
    return response.data;
  }

  static async quickCreateCustomer(data: CustomerQuickCreate): Promise<ApiResponse<{ customer: Customer }>> {
    const response = await apiClient.post('/customers/quick-create', data);
    return response.data;
  }

  static async updateCustomer(id: string, data: CustomerUpdate): Promise<ApiResponse<{ customer: Customer }>> {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  }

  static async deleteCustomer(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  }

  // Customer Statistics
  static async getCustomerStats(): Promise<ApiResponse<{ stats: CustomerStats }>> {
    const response = await apiClient.get('/customers/stats');
    return response.data;
  }

  // Customer Devices
  static async getCustomerDevices(customerId: string): Promise<ApiResponse<{ devices: CustomerDeviceSummary[] }>> {
    const response = await apiClient.get(`/customers/${customerId}/devices`);
    return response.data;
  }

  // Customer Work Orders
  static async getCustomerWorkOrders(customerId: string, params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<CustomerWorkOrderSummary>>> {
    const response = await apiClient.get(`/customers/${customerId}/work-orders`, { params });
    return response.data;
  }

  // Customer Contact History
  static async getCustomerContacts(customerId: string, params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<CustomerContact>>> {
    const response = await apiClient.get(`/customers/${customerId}/contacts`, { params });
    return response.data;
  }

  static async addCustomerContact(customerId: string, data: CustomerContactCreate): Promise<ApiResponse<{ contact: CustomerContact }>> {
    const response = await apiClient.post(`/customers/${customerId}/contacts`, data);
    return response.data;
  }

  static async updateCustomerContact(customerId: string, contactId: string, data: Partial<CustomerContactCreate>): Promise<ApiResponse<{ contact: CustomerContact }>> {
    const response = await apiClient.put(`/customers/${customerId}/contacts/${contactId}`, data);
    return response.data;
  }

  static async deleteCustomerContact(customerId: string, contactId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/customers/${customerId}/contacts/${contactId}`);
    return response.data;
  }

  // Customer Search and Filter
  static async searchCustomers(query: string): Promise<ApiResponse<{ customers: Customer[] }>> {
    const response = await apiClient.get('/customers/search', { 
      params: { q: query, limit: 10 } 
    });
    return response.data;
  }

  static async getCustomersByStatus(isActive: boolean): Promise<ApiResponse<{ customers: Customer[] }>> {
    const response = await apiClient.get('/customers', { 
      params: { isActive } 
    });
    return response.data;
  }

  // Customer Analytics
  static async getCustomerAnalytics(customerId: string, params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{
    totalWorkOrders: number;
    totalSpent: number;
    averageWorkOrderValue: number;
    lastActivity: string;
    satisfactionRating: number;
    preferredTechnician: string;
    commonIssues: Array<{ issue: string; count: number }>;
  }>> {
    const response = await apiClient.get(`/customers/${customerId}/analytics`, { params });
    return response.data;
  }

  // Customer Communication
  static async sendEmailToCustomer(customerId: string, data: {
    subject: string;
    message: string;
    template?: string;
  }): Promise<ApiResponse<{ messageId: string }>> {
    const response = await apiClient.post(`/customers/${customerId}/send-email`, data);
    return response.data;
  }

  static async sendSmsToCustomer(customerId: string, data: {
    message: string;
    template?: string;
  }): Promise<ApiResponse<{ messageId: string }>> {
    const response = await apiClient.post(`/customers/${customerId}/send-sms`, data);
    return response.data;
  }

  // Customer Documents
  static async getCustomerDocuments(customerId: string): Promise<ApiResponse<{ documents: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    url: string;
  }> }>> {
    const response = await apiClient.get(`/customers/${customerId}/documents`);
    return response.data;
  }

  static async uploadCustomerDocument(customerId: string, file: File, documentType: string): Promise<ApiResponse<{ document: any }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await apiClient.post(`/customers/${customerId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Customer Notes
  static async getCustomerNotes(customerId: string): Promise<ApiResponse<{ notes: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
    isPrivate: boolean;
  }> }>> {
    const response = await apiClient.get(`/customers/${customerId}/notes`);
    return response.data;
  }

  static async addCustomerNote(customerId: string, data: {
    content: string;
    isPrivate?: boolean;
  }): Promise<ApiResponse<{ note: any }>> {
    const response = await apiClient.post(`/customers/${customerId}/notes`, data);
    return response.data;
  }

  // Customer Tags
  static async getCustomerTags(customerId: string): Promise<ApiResponse<{ tags: string[] }>> {
    const response = await apiClient.get(`/customers/${customerId}/tags`);
    return response.data;
  }

  static async addCustomerTag(customerId: string, tag: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post(`/customers/${customerId}/tags`, { tag });
    return response.data;
  }

  static async removeCustomerTag(customerId: string, tag: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/customers/${customerId}/tags/${encodeURIComponent(tag)}`);
    return response.data;
  }

  // Export
  static async exportCustomers(params: CustomerFilters = {}): Promise<Blob> {
    const response = await apiClient.get('/customers/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Helper Methods
  static buildFilters(params: CustomerFilters): Record<string, any> {
    const filters: Record<string, any> = {};

    if (params.search) filters.search = params.search;
    if (params.isActive !== undefined) filters.isActive = params.isActive;
    if (params.hasDevices !== undefined) filters.hasDevices = params.hasDevices;
    if (params.hasWorkOrders !== undefined) filters.hasWorkOrders = params.hasWorkOrders;

    return filters;
  }

  // Validation
  static validateCustomerData(data: CustomerCreate): string[] {
    const errors: string[] = [];

    if (!data.companyName?.trim()) {
      errors.push('Company name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone number format');
    }

    return errors;
  }

  // Format helpers
  static formatCustomerName(customer: Customer): string {
    return customer.contactPerson 
      ? `${customer.contactPerson} (${customer.companyName})`
      : customer.companyName;
  }

  static getCustomerInitials(customer: Customer): string {
    const name = customer.contactPerson || customer.companyName;
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
