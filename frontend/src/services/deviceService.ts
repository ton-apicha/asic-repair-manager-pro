import { apiClient } from './apiClient';
import { 
  Device, 
  DeviceCreate, 
  DeviceUpdate,
  DeviceQuickCreate,
  DeviceFilters,
  DeviceStats,
  DevicePerformance,
  DeviceRepairHistory,
  DeviceWarrantyInfo,
  DeviceHealthCheck,
  DeviceHealthCheckCreate,
  DeviceMaintenance,
  DeviceMaintenanceCreate,
  DeviceModel,
  PaginatedResponse
} from '../types/device';
import { ApiResponse, PaginationParams } from '../types/common';

export class DeviceService {
  // Device CRUD
  static async getDevices(params: PaginationParams & DeviceFilters = {}): Promise<ApiResponse<PaginatedResponse<Device>>> {
    const response = await apiClient.get('/devices', { params });
    return response.data;
  }

  static async getDeviceById(id: string): Promise<ApiResponse<{ device: Device }>> {
    const response = await apiClient.get(`/devices/${id}`);
    return response.data;
  }

  static async createDevice(data: DeviceCreate): Promise<ApiResponse<{ device: Device }>> {
    const response = await apiClient.post('/devices', data);
    return response.data;
  }

  static async quickCreateDevice(data: DeviceQuickCreate): Promise<ApiResponse<{ device: Device }>> {
    const response = await apiClient.post('/devices/quick-create', data);
    return response.data;
  }

  static async updateDevice(id: string, data: DeviceUpdate): Promise<ApiResponse<{ device: Device }>> {
    const response = await apiClient.put(`/devices/${id}`, data);
    return response.data;
  }

  static async deleteDevice(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/devices/${id}`);
    return response.data;
  }

  // Device Statistics
  static async getDeviceStats(): Promise<ApiResponse<{ stats: DeviceStats }>> {
    const response = await apiClient.get('/devices/stats');
    return response.data;
  }

  // Device Performance
  static async getDevicePerformance(deviceId: string): Promise<ApiResponse<{ performance: DevicePerformance }>> {
    const response = await apiClient.get(`/devices/${deviceId}/performance`);
    return response.data;
  }

  static async getAllDevicePerformance(): Promise<ApiResponse<{ performance: DevicePerformance[] }>> {
    const response = await apiClient.get('/devices/performance');
    return response.data;
  }

  // Device Repair History
  static async getDeviceRepairHistory(deviceId: string, params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<DeviceRepairHistory>>> {
    const response = await apiClient.get(`/devices/${deviceId}/repair-history`, { params });
    return response.data;
  }

  // Device Warranty
  static async getDeviceWarrantyInfo(deviceId: string): Promise<ApiResponse<{ warranty: DeviceWarrantyInfo }>> {
    const response = await apiClient.get(`/devices/${deviceId}/warranty`);
    return response.data;
  }

  static async getAllWarrantyInfo(): Promise<ApiResponse<{ warranties: DeviceWarrantyInfo[] }>> {
    const response = await apiClient.get('/devices/warranties');
    return response.data;
  }

  static async getExpiringWarranties(days: number = 30): Promise<ApiResponse<{ warranties: DeviceWarrantyInfo[] }>> {
    const response = await apiClient.get('/devices/warranties/expiring', { 
      params: { days } 
    });
    return response.data;
  }

  // Device Health Check
  static async getDeviceHealthCheck(deviceId: string): Promise<ApiResponse<{ healthCheck: DeviceHealthCheck }>> {
    const response = await apiClient.get(`/devices/${deviceId}/health-check`);
    return response.data;
  }

  static async createDeviceHealthCheck(deviceId: string, data: DeviceHealthCheckCreate): Promise<ApiResponse<{ healthCheck: DeviceHealthCheck }>> {
    const response = await apiClient.post(`/devices/${deviceId}/health-check`, data);
    return response.data;
  }

  static async getHealthCheckHistory(deviceId: string, params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<DeviceHealthCheck>>> {
    const response = await apiClient.get(`/devices/${deviceId}/health-check/history`, { params });
    return response.data;
  }

  // Device Maintenance
  static async getDeviceMaintenance(deviceId: string, params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<DeviceMaintenance>>> {
    const response = await apiClient.get(`/devices/${deviceId}/maintenance`, { params });
    return response.data;
  }

  static async createDeviceMaintenance(deviceId: string, data: DeviceMaintenanceCreate): Promise<ApiResponse<{ maintenance: DeviceMaintenance }>> {
    const response = await apiClient.post(`/devices/${deviceId}/maintenance`, data);
    return response.data;
  }

  static async updateDeviceMaintenance(deviceId: string, maintenanceId: string, data: Partial<DeviceMaintenanceCreate>): Promise<ApiResponse<{ maintenance: DeviceMaintenance }>> {
    const response = await apiClient.put(`/devices/${deviceId}/maintenance/${maintenanceId}`, data);
    return response.data;
  }

  static async getMaintenanceSchedule(): Promise<ApiResponse<{ maintenance: DeviceMaintenance[] }>> {
    const response = await apiClient.get('/devices/maintenance/schedule');
    return response.data;
  }

  // Device Models
  static async getDeviceModels(): Promise<ApiResponse<{ models: DeviceModel[] }>> {
    const response = await apiClient.get('/devices/models');
    return response.data;
  }

  static async getDeviceModelById(id: string): Promise<ApiResponse<{ model: DeviceModel }>> {
    const response = await apiClient.get(`/devices/models/${id}`);
    return response.data;
  }

  static async createDeviceModel(data: Omit<DeviceModel, 'id'>): Promise<ApiResponse<{ model: DeviceModel }>> {
    const response = await apiClient.post('/devices/models', data);
    return response.data;
  }

  static async updateDeviceModel(id: string, data: Partial<Omit<DeviceModel, 'id'>>): Promise<ApiResponse<{ model: DeviceModel }>> {
    const response = await apiClient.put(`/devices/models/${id}`, data);
    return response.data;
  }

  // Device Search and Filter
  static async searchDevices(query: string): Promise<ApiResponse<{ devices: Device[] }>> {
    const response = await apiClient.get('/devices/search', { 
      params: { q: query, limit: 10 } 
    });
    return response.data;
  }

  static async getDevicesByStatus(status: string): Promise<ApiResponse<{ devices: Device[] }>> {
    const response = await apiClient.get('/devices', { 
      params: { status } 
    });
    return response.data;
  }

  static async getDevicesByCustomer(customerId: string): Promise<ApiResponse<{ devices: Device[] }>> {
    const response = await apiClient.get('/devices', { 
      params: { customerId } 
    });
    return response.data;
  }

  // Device Analytics
  static async getDeviceAnalytics(deviceId: string, params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{
    totalRepairs: number;
    totalCost: number;
    averageRepairTime: number;
    uptime: number;
    efficiency: number;
    lastRepairDate: string;
    commonIssues: Array<{ issue: string; count: number }>;
    performanceTrend: Array<{ date: string; hashrate: number; powerConsumption: number }>;
  }>> {
    const response = await apiClient.get(`/devices/${deviceId}/analytics`, { params });
    return response.data;
  }

  // Device QR Code
  static async generateDeviceQRCode(deviceId: string): Promise<ApiResponse<{ qrCode: string; qrCodeUrl: string }>> {
    const response = await apiClient.post(`/devices/${deviceId}/qr-code`);
    return response.data;
  }

  static async getDeviceByQRCode(qrCode: string): Promise<ApiResponse<{ device: Device }>> {
    const response = await apiClient.get(`/devices/qr/${qrCode}`);
    return response.data;
  }

  // Device Documents
  static async getDeviceDocuments(deviceId: string): Promise<ApiResponse<{ documents: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    url: string;
  }> }>> {
    const response = await apiClient.get(`/devices/${deviceId}/documents`);
    return response.data;
  }

  static async uploadDeviceDocument(deviceId: string, file: File, documentType: string): Promise<ApiResponse<{ document: any }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await apiClient.post(`/devices/${deviceId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Export
  static async exportDevices(params: DeviceFilters = {}): Promise<Blob> {
    const response = await apiClient.get('/devices/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Helper Methods
  static buildFilters(params: DeviceFilters): Record<string, any> {
    const filters: Record<string, any> = {};

    if (params.search) filters.search = params.search;
    if (params.status) filters.status = params.status;
    if (params.model) filters.model = params.model;
    if (params.customerId) filters.customerId = params.customerId;
    if (params.hasWarranty !== undefined) filters.hasWarranty = params.hasWarranty;
    if (params.warrantyExpiring !== undefined) filters.warrantyExpiring = params.warrantyExpiring;
    if (params.hasWorkOrders !== undefined) filters.hasWorkOrders = params.hasWorkOrders;

    return filters;
  }

  // Validation
  static validateDeviceData(data: DeviceCreate): string[] {
    const errors: string[] = [];

    if (!data.customerId?.trim()) {
      errors.push('Customer is required');
    }

    if (!data.model?.trim()) {
      errors.push('Device model is required');
    }

    if (!data.serialNumber?.trim()) {
      errors.push('Serial number is required');
    }

    if (data.hashrate && data.hashrate < 0) {
      errors.push('Hashrate must be positive');
    }

    if (data.powerConsumption && data.powerConsumption < 0) {
      errors.push('Power consumption must be positive');
    }

    return errors;
  }

  // Status helpers
  static getDeviceStatusColor(status: string): string {
    const colors: Record<string, string> = {
      ACTIVE: '#4caf50',
      REPAIR: '#ff9800',
      RETIRED: '#757575',
    };
    return colors[status] || '#757575';
  }

  static getDeviceStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Active',
      REPAIR: 'Under Repair',
      RETIRED: 'Retired',
    };
    return labels[status] || status;
  }

  // Health check helpers
  static getHealthStatusColor(health: string): string {
    const colors: Record<string, string> = {
      excellent: '#4caf50',
      good: '#8bc34a',
      fair: '#ff9800',
      poor: '#ff5722',
      critical: '#f44336',
    };
    return colors[health] || '#757575';
  }

  static getHealthStatusLabel(health: string): string {
    const labels: Record<string, string> = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      critical: 'Critical',
    };
    return labels[health] || health;
  }

  // Warranty helpers
  static isWarrantyExpiring(warranty: DeviceWarrantyInfo, days: number = 30): boolean {
    const now = new Date();
    const endDate = new Date(warranty.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays > 0;
  }

  static isWarrantyExpired(warranty: DeviceWarrantyInfo): boolean {
    const now = new Date();
    const endDate = new Date(warranty.endDate);
    return now > endDate;
  }
}
