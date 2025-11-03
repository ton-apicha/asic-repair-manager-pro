import { ChartDataPoint, TimeSeriesDataPoint } from './common';

// Dashboard KPI Types
export interface DashboardKPIs {
  workOrders: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    completionRate: number;
    averageCompletionTime: number; // hours
  };
  technicians: {
    total: number;
    active: number;
    available: number;
    utilizationRate: number; // percentage
  };
  inventory: {
    totalParts: number;
    lowStock: number;
    outOfStock: number;
    availabilityRate: number; // percentage
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number; // percentage
    averagePerWorkOrder: number;
  };
  performance: {
    averageTimeToRepair: number; // hours (ATTR)
    firstTimeFixRate: number; // percentage (FTFR)
    averageTotalCostPerRepair: number; // ATCR
    revenuePerTechnician: number;
  };
}

// Dashboard Chart Data Types
export interface PerformanceChartData extends TimeSeriesDataPoint {
  workOrders: number;
  completed: number;
  revenue: number;
  cost: number;
}

export interface StatusDistributionData extends ChartDataPoint {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface TechnicianUtilizationData {
  id: string;
  name: string;
  utilizationRate: number;
  totalHours: number;
  workOrders: number;
  efficiency: number; // work orders per hour
}

export interface RevenueChartData extends TimeSeriesDataPoint {
  revenue: number;
  cost: number;
  profit: number;
  workOrders: number;
}

// Recent Activities
export interface RecentActivity {
  id: string;
  type: 'work_order_created' | 'work_order_updated' | 'work_order_completed' | 'diagnostic_added' | 'parts_used' | 'technician_assigned';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  workOrderId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
}

// System Alerts
export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  category: 'inventory' | 'schedule' | 'system' | 'work_order' | 'technician';
}

// Inventory Alerts
export interface InventoryAlert {
  id: string;
  partId: string;
  partNumber: string;
  partName: string;
  currentStock: number;
  minStockLevel: number;
  status: 'low_stock' | 'out_of_stock' | 'overstock';
  urgency: 'low' | 'medium' | 'high';
  lastRestocked?: string;
  supplier?: string;
  estimatedRestockDate?: string;
}

// Work Order Trends
export interface WorkOrderTrends {
  daily: Array<{
    date: string;
    created: number;
    completed: number;
    inProgress: number;
  }>;
  weekly: Array<{
    week: string;
    created: number;
    completed: number;
    averageCompletionTime: number;
  }>;
  monthly: Array<{
    month: string;
    created: number;
    completed: number;
    revenue: number;
    cost: number;
  }>;
}

// Customer Satisfaction
export interface CustomerSatisfaction {
  overallRating: number; // 1-5
  totalResponses: number;
  ratings: {
    excellent: number; // 5 stars
    good: number; // 4 stars
    average: number; // 3 stars
    poor: number; // 2 stars
    terrible: number; // 1 star
  };
  feedback: Array<{
    id: string;
    workOrderId: string;
    customerName: string;
    rating: number;
    comment?: string;
    timestamp: string;
  }>;
}

// Equipment Health
export interface EquipmentHealth {
  totalDevices: number;
  healthyDevices: number;
  devicesNeedingAttention: number;
  devicesUnderRepair: number;
  averageUptime: number; // percentage
  criticalIssues: number;
  maintenanceDue: number;
  warrantyExpiring: number;
}

// Cost Analysis
export interface CostAnalysis {
  totalCosts: number;
  laborCosts: number;
  partsCosts: number;
  overheadCosts: number;
  costPerWorkOrder: number;
  costTrends: Array<{
    period: string;
    total: number;
    labor: number;
    parts: number;
    overhead: number;
  }>;
  topExpensiveParts: Array<{
    partId: string;
    partName: string;
    totalCost: number;
    usageCount: number;
  }>;
}

// Productivity Metrics
export interface ProductivityMetrics {
  workOrdersPerDay: number;
  workOrdersPerTechnician: number;
  averageWorkOrderValue: number;
  revenuePerHour: number;
  efficiencyScore: number; // 0-100
  bottlenecks: Array<{
    stage: string;
    averageTime: number;
    improvement: string;
  }>;
}

// Dashboard Widget Configuration
export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'list' | 'alert';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
  refreshInterval?: number; // seconds
  isVisible: boolean;
}

// Dashboard Layout
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Real-time Updates
export interface DashboardUpdate {
  type: 'kpi' | 'chart' | 'activity' | 'alert';
  data: any;
  timestamp: string;
}

// Export/Import Types
export interface DashboardExport {
  kpis: DashboardKPIs;
  charts: {
    performance: PerformanceChartData[];
    statusDistribution: StatusDistributionData[];
    revenue: RevenueChartData[];
    technicianUtilization: TechnicianUtilizationData[];
  };
  activities: RecentActivity[];
  alerts: SystemAlert[];
  trends: WorkOrderTrends;
  exportDate: string;
  period: {
    startDate: string;
    endDate: string;
  };
}
