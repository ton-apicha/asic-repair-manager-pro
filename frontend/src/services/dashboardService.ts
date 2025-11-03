import { apiClient } from './apiClient';
import { 
  DashboardKPIs,
  PerformanceChartData,
  StatusDistributionData,
  TechnicianUtilizationData,
  RevenueChartData,
  RecentActivity,
  SystemAlert,
  InventoryAlert,
  WorkOrderTrends,
  CustomerSatisfaction,
  EquipmentHealth,
  CostAnalysis,
  ProductivityMetrics,
  DashboardLayout,
  DashboardUpdate
} from '../types/dashboard';
import { ApiResponse } from '../types/common';

export class DashboardService {
  // Main Dashboard Data
  static async getDashboardKPIs(): Promise<ApiResponse<{ kpis: DashboardKPIs }>> {
    const response = await apiClient.get('/reports/dashboard-stats');
    return response.data;
  }

  // Chart Data
  static async getPerformanceChart(params: { startDate?: string; endDate?: string; period?: 'daily' | 'weekly' | 'monthly' } = {}): Promise<ApiResponse<{ data: PerformanceChartData[] }>> {
    const response = await apiClient.get('/reports/performance-chart', { params });
    return response.data;
  }

  static async getStatusDistribution(): Promise<ApiResponse<{ data: StatusDistributionData[] }>> {
    const response = await apiClient.get('/reports/status-distribution');
    return response.data;
  }

  static async getTechnicianUtilization(): Promise<ApiResponse<{ data: TechnicianUtilizationData[] }>> {
    const response = await apiClient.get('/reports/technician-utilization');
    return response.data;
  }

  static async getRevenueChart(params: { startDate?: string; endDate?: string; period?: 'daily' | 'weekly' | 'monthly' } = {}): Promise<ApiResponse<{ data: RevenueChartData[] }>> {
    const response = await apiClient.get('/reports/revenue-chart', { params });
    return response.data;
  }

  // Activities and Alerts
  static async getRecentActivities(limit: number = 10): Promise<ApiResponse<{ activities: RecentActivity[] }>> {
    const response = await apiClient.get('/reports/recent-activities', { 
      params: { limit } 
    });
    return response.data;
  }

  static async getSystemAlerts(): Promise<ApiResponse<{ alerts: SystemAlert[] }>> {
    const response = await apiClient.get('/reports/system-alerts');
    return response.data;
  }

  static async getInventoryAlerts(): Promise<ApiResponse<{ alerts: InventoryAlert[] }>> {
    const response = await apiClient.get('/reports/inventory-alerts');
    return response.data;
  }

  static async markAlertAsRead(alertId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put(`/reports/alerts/${alertId}/read`);
    return response.data;
  }

  static async markAllAlertsAsRead(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put('/reports/alerts/read-all');
    return response.data;
  }

  // Trends and Analytics
  static async getWorkOrderTrends(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ trends: WorkOrderTrends }>> {
    const response = await apiClient.get('/reports/work-order-trends', { params });
    return response.data;
  }

  static async getCustomerSatisfaction(): Promise<ApiResponse<{ satisfaction: CustomerSatisfaction }>> {
    const response = await apiClient.get('/reports/customer-satisfaction');
    return response.data;
  }

  static async getEquipmentHealth(): Promise<ApiResponse<{ health: EquipmentHealth }>> {
    const response = await apiClient.get('/reports/equipment-health');
    return response.data;
  }

  static async getCostAnalysis(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ analysis: CostAnalysis }>> {
    const response = await apiClient.get('/reports/cost-analysis', { params });
    return response.data;
  }

  static async getProductivityMetrics(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ metrics: ProductivityMetrics }>> {
    const response = await apiClient.get('/reports/productivity-metrics', { params });
    return response.data;
  }

  // Real-time Updates
  static async subscribeToUpdates(): Promise<EventSource> {
    return new EventSource('/api/v1/reports/updates');
  }

  static async getDashboardUpdate(): Promise<ApiResponse<{ update: DashboardUpdate }>> {
    const response = await apiClient.get('/reports/dashboard-update');
    return response.data;
  }

  // Dashboard Configuration
  static async getDashboardLayout(layoutId?: string): Promise<ApiResponse<{ layout: DashboardLayout }>> {
    const response = await apiClient.get('/reports/dashboard-layout', { 
      params: layoutId ? { layoutId } : {} 
    });
    return response.data;
  }

  static async saveDashboardLayout(layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ layout: DashboardLayout }>> {
    const response = await apiClient.post('/reports/dashboard-layout', layout);
    return response.data;
  }

  static async updateDashboardLayout(layoutId: string, layout: Partial<Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<{ layout: DashboardLayout }>> {
    const response = await apiClient.put(`/reports/dashboard-layout/${layoutId}`, layout);
    return response.data;
  }

  static async deleteDashboardLayout(layoutId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/reports/dashboard-layout/${layoutId}`);
    return response.data;
  }

  // Widget Management
  static async getAvailableWidgets(): Promise<ApiResponse<{ widgets: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    defaultConfig: any;
    category: string;
  }> }>> {
    const response = await apiClient.get('/reports/widgets');
    return response.data;
  }

  static async getWidgetData(widgetId: string, config: any = {}): Promise<ApiResponse<{ data: any }>> {
    const response = await apiClient.post(`/reports/widgets/${widgetId}/data`, { config });
    return response.data;
  }

  // Export and Reports
  static async exportDashboard(params: { startDate?: string; endDate?: string; format?: 'pdf' | 'excel' | 'csv' } = {}): Promise<Blob> {
    const response = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  static async generateReport(reportType: string, params: { startDate?: string; endDate?: string; format?: 'pdf' | 'excel' | 'csv' } = {}): Promise<Blob> {
    const response = await apiClient.post(`/reports/generate/${reportType}`, params, {
      responseType: 'blob',
    });
    return response.data;
  }

  // KPI Calculations
  static calculateKPIs(data: any): DashboardKPIs {
    const workOrders = data.workOrders || [];
    const technicians = data.technicians || [];
    const parts = data.parts || [];
    const revenue = data.revenue || {};

    const completedWorkOrders = workOrders.filter((wo: any) => wo.status === 'CLOSURE').length;
    const inProgressWorkOrders = workOrders.filter((wo: any) => wo.status === 'EXECUTION').length;
    const pendingWorkOrders = workOrders.filter((wo: any) => ['TRIAGE', 'QUOTATION'].includes(wo.status)).length;

    const activeTechnicians = technicians.filter((t: any) => t.isActive).length;
    const availableTechnicians = technicians.filter((t: any) => t.isActive && t.utilizationRate < 90).length;

    const lowStockParts = parts.filter((p: any) => p.quantityInStock <= p.minStockLevel).length;
    const outOfStockParts = parts.filter((p: any) => p.quantityInStock === 0).length;

    return {
      workOrders: {
        total: workOrders.length,
        completed: completedWorkOrders,
        inProgress: inProgressWorkOrders,
        pending: pendingWorkOrders,
        completionRate: workOrders.length > 0 ? Math.round((completedWorkOrders / workOrders.length) * 100) : 0,
        averageCompletionTime: this.calculateAverageCompletionTime(workOrders),
      },
      technicians: {
        total: technicians.length,
        active: activeTechnicians,
        available: availableTechnicians,
        utilizationRate: activeTechnicians > 0 ? Math.round(technicians.reduce((sum: number, t: any) => sum + (t.utilizationRate || 0), 0) / activeTechnicians) : 0,
      },
      inventory: {
        totalParts: parts.length,
        lowStock: lowStockParts,
        outOfStock: outOfStockParts,
        availabilityRate: parts.length > 0 ? Math.round(((parts.length - outOfStockParts) / parts.length) * 100) : 0,
      },
      revenue: {
        total: revenue.total || 0,
        thisMonth: revenue.thisMonth || 0,
        lastMonth: revenue.lastMonth || 0,
        growthRate: revenue.lastMonth > 0 ? Math.round(((revenue.thisMonth - revenue.lastMonth) / revenue.lastMonth) * 100) : 0,
        averagePerWorkOrder: completedWorkOrders > 0 ? Math.round(revenue.total / completedWorkOrders) : 0,
      },
      performance: {
        averageTimeToRepair: this.calculateATTR(workOrders),
        firstTimeFixRate: this.calculateFTFR(workOrders),
        averageTotalCostPerRepair: this.calculateATCR(workOrders),
        revenuePerTechnician: activeTechnicians > 0 ? Math.round(revenue.total / activeTechnicians) : 0,
      },
    };
  }

  // Helper Methods
  private static calculateAverageCompletionTime(workOrders: any[]): number {
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'CLOSURE' && wo.completedAt && wo.createdAt);
    if (completedWorkOrders.length === 0) return 0;

    const totalHours = completedWorkOrders.reduce((sum, wo) => {
      const start = new Date(wo.createdAt);
      const end = new Date(wo.completedAt);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return Math.round(totalHours / completedWorkOrders.length);
  }

  private static calculateATTR(workOrders: any[]): number {
    return this.calculateAverageCompletionTime(workOrders);
  }

  private static calculateFTFR(workOrders: any[]): number {
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'CLOSURE');
    if (completedWorkOrders.length === 0) return 0;

    const firstTimeFixed = completedWorkOrders.filter(wo => wo.firstTimeFix === true).length;
    return Math.round((firstTimeFixed / completedWorkOrders.length) * 100);
  }

  private static calculateATCR(workOrders: any[]): number {
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'CLOSURE' && wo.actualCost);
    if (completedWorkOrders.length === 0) return 0;

    const totalCost = completedWorkOrders.reduce((sum, wo) => sum + (wo.actualCost || 0), 0);
    return Math.round(totalCost / completedWorkOrders.length);
  }

  // Chart Data Helpers
  static formatChartData(data: any[], xKey: string, yKey: string): Array<{ [key: string]: any }> {
    return data.map(item => ({
      [xKey]: item[xKey],
      [yKey]: item[yKey],
      ...item,
    }));
  }

  static getChartColors(): string[] {
    return [
      '#1976d2', // Blue
      '#4caf50', // Green
      '#ff9800', // Orange
      '#f44336', // Red
      '#9c27b0', // Purple
      '#00bcd4', // Cyan
      '#795548', // Brown
      '#607d8b', // Blue Grey
    ];
  }

  // Alert Helpers
  static getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
      success: '✅',
    };
    return icons[type] || 'ℹ️';
  }

  static getAlertColor(type: string): string {
    const colors: Record<string, string> = {
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
      success: '#4caf50',
    };
    return colors[type] || '#757575';
  }

  // Refresh Helpers
  static createRefreshInterval(callback: () => void, interval: number = 30000): NodeJS.Timeout {
    return setInterval(callback, interval);
  }

  static clearRefreshInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
  }
}
