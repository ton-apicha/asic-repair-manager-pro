import { apiClient } from './apiClient';
import { 
  WorkOrder, 
  WorkOrderCreate, 
  WorkOrderUpdate, 
  WorkOrderFilters,
  WorkOrderStats,
  TechnicianPerformance,
  WorkOrderTimeline,
  StatusUpdate,
  TechnicianAssignment,
  Diagnostic,
  DiagnosticCreate,
  PartsUsage,
  PartsUsageCreate,
  TimeLog,
  TimeLogCreate,
  WorkOrderDocument,
  WorkOrderDocumentCreate,
  PaginatedResponse
} from '../types/workOrder';
import { ApiResponse, PaginationParams } from '../types/common';

export class WorkOrderService {
  // Work Orders CRUD
  static async getWorkOrders(params: PaginationParams & WorkOrderFilters = {}): Promise<ApiResponse<PaginatedResponse<WorkOrder>>> {
    const response = await apiClient.get('/work-orders', { params });
    return response.data;
  }

  static async getWorkOrderById(id: string): Promise<ApiResponse<{ workOrder: WorkOrder }>> {
    const response = await apiClient.get(`/work-orders/${id}`);
    return response.data;
  }

  static async createWorkOrder(data: WorkOrderCreate): Promise<ApiResponse<{ workOrder: WorkOrder }>> {
    const response = await apiClient.post('/work-orders', data);
    return response.data;
  }

  static async updateWorkOrder(id: string, data: WorkOrderUpdate): Promise<ApiResponse<{ workOrder: WorkOrder }>> {
    const response = await apiClient.put(`/work-orders/${id}`, data);
    return response.data;
  }

  static async deleteWorkOrder(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/work-orders/${id}`);
    return response.data;
  }

  // Work Order Status Management
  static async updateStatus(id: string, data: StatusUpdate): Promise<ApiResponse<{ workOrder: WorkOrder }>> {
    const response = await apiClient.post(`/work-orders/${id}/status`, data);
    return response.data;
  }

  static async assignTechnician(id: string, data: TechnicianAssignment): Promise<ApiResponse<{ workOrder: WorkOrder }>> {
    const response = await apiClient.post(`/work-orders/${id}/assign`, data);
    return response.data;
  }

  // Diagnostics
  static async createDiagnostic(workOrderId: string, data: DiagnosticCreate): Promise<ApiResponse<{ diagnostic: Diagnostic }>> {
    const response = await apiClient.post(`/work-orders/${workOrderId}/diagnostics`, data);
    return response.data;
  }

  static async getDiagnostics(workOrderId: string): Promise<ApiResponse<{ diagnostics: Diagnostic[] }>> {
    const response = await apiClient.get(`/work-orders/${workOrderId}/diagnostics`);
    return response.data;
  }

  // Parts Usage
  static async addPartsUsage(workOrderId: string, data: PartsUsageCreate): Promise<ApiResponse<{ partsUsage: PartsUsage }>> {
    const response = await apiClient.post(`/work-orders/${workOrderId}/parts`, data);
    return response.data;
  }

  static async getPartsUsage(workOrderId: string): Promise<ApiResponse<{ partsUsage: PartsUsage[] }>> {
    const response = await apiClient.get(`/work-orders/${workOrderId}/parts`);
    return response.data;
  }

  // Time Logs
  static async addTimeLog(workOrderId: string, data: TimeLogCreate): Promise<ApiResponse<{ timeLog: TimeLog }>> {
    const response = await apiClient.post(`/work-orders/${workOrderId}/time-logs`, data);
    return response.data;
  }

  static async getTimeLogs(workOrderId: string): Promise<ApiResponse<{ timeLogs: TimeLog[] }>> {
    const response = await apiClient.get(`/work-orders/${workOrderId}/time-logs`);
    return response.data;
  }

  // Documents
  static async uploadDocument(workOrderId: string, data: WorkOrderDocumentCreate): Promise<ApiResponse<{ document: WorkOrderDocument }>> {
    const formData = new FormData();
    formData.append('documentType', data.documentType);
    formData.append('file', data.file);

    const response = await apiClient.post(`/work-orders/${workOrderId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getDocuments(workOrderId: string): Promise<ApiResponse<{ documents: WorkOrderDocument[] }>> {
    const response = await apiClient.get(`/work-orders/${workOrderId}/documents`);
    return response.data;
  }

  // Timeline
  static async getTimeline(workOrderId: string): Promise<ApiResponse<{ timeline: WorkOrderTimeline }>> {
    const response = await apiClient.get(`/work-orders/${workOrderId}/timeline`);
    return response.data;
  }

  // Statistics
  static async getStatsSummary(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ stats: WorkOrderStats }>> {
    const response = await apiClient.get('/work-orders/stats/summary', { params });
    return response.data;
  }

  static async getTechnicianPerformance(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ performance: TechnicianPerformance[] }>> {
    const response = await apiClient.get('/work-orders/stats/technician-performance', { params });
    return response.data;
  }

  // Bulk Operations
  static async bulkUpdateStatus(workOrderIds: string[], status: string): Promise<ApiResponse<{ updated: number }>> {
    const response = await apiClient.post('/work-orders/bulk/status', {
      workOrderIds,
      status,
    });
    return response.data;
  }

  static async bulkAssignTechnician(workOrderIds: string[], technicianId: string): Promise<ApiResponse<{ updated: number }>> {
    const response = await apiClient.post('/work-orders/bulk/assign', {
      workOrderIds,
      technicianId,
    });
    return response.data;
  }

  // Export
  static async exportWorkOrders(params: WorkOrderFilters = {}): Promise<Blob> {
    const response = await apiClient.get('/work-orders/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Search and Filter Helpers
  static buildFilters(params: WorkOrderFilters): Record<string, any> {
    const filters: Record<string, any> = {};

    if (params.search) filters.search = params.search;
    if (params.status) filters.status = params.status;
    if (params.priority) filters.priority = params.priority;
    if (params.technicianId) filters.technicianId = params.technicianId;
    if (params.customerId) filters.customerId = params.customerId;
    if (params.deviceId) filters.deviceId = params.deviceId;
    if (params.startDate) filters.startDate = params.startDate;
    if (params.endDate) filters.endDate = params.endDate;
    if (params.createdBy) filters.createdBy = params.createdBy;

    return filters;
  }

  // Status Transition Validation
  static canTransitionToStatus(currentStatus: string, targetStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      TRIAGE: ['QUOTATION', 'CLOSURE'],
      QUOTATION: ['EXECUTION', 'TRIAGE'],
      EXECUTION: ['QA', 'TRIAGE'],
      QA: ['CLOSURE', 'EXECUTION'],
      CLOSURE: ['WARRANTY'],
      WARRANTY: ['CLOSURE'],
    };

    return validTransitions[currentStatus]?.includes(targetStatus) || false;
  }

  // Priority Colors
  static getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      LOW: '#4caf50',
      MEDIUM: '#ff9800',
      HIGH: '#f44336',
      URGENT: '#9c27b0',
    };
    return colors[priority] || '#757575';
  }

  // Status Colors
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      TRIAGE: '#757575',
      QUOTATION: '#2196f3',
      EXECUTION: '#ff9800',
      QA: '#9c27b0',
      CLOSURE: '#4caf50',
      WARRANTY: '#00bcd4',
    };
    return colors[status] || '#757575';
  }
}
