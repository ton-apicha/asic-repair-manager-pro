import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../services/dashboardService';
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
  ProductivityMetrics
} from '../types/dashboard';
import { ApiResponse } from '../types/common';

interface UseDashboardOptions {
  enabled?: boolean;
  refetchInterval?: number;
  autoRefresh?: boolean;
}

interface UseDashboardReturn {
  kpis: DashboardKPIs | null;
  performanceChart: PerformanceChartData[] | null;
  statusDistribution: StatusDistributionData[] | null;
  technicianUtilization: TechnicianUtilizationData[] | null;
  revenueChart: RevenueChartData[] | null;
  recentActivities: RecentActivity[] | null;
  systemAlerts: SystemAlert[] | null;
  inventoryAlerts: InventoryAlert[] | null;
  workOrderTrends: WorkOrderTrends | null;
  customerSatisfaction: CustomerSatisfaction | null;
  equipmentHealth: EquipmentHealth | null;
  costAnalysis: CostAnalysis | null;
  productivityMetrics: ProductivityMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchKPIs: () => Promise<void>;
  refetchCharts: () => Promise<void>;
  refetchActivities: () => Promise<void>;
  refetchAlerts: () => Promise<void>;
  clearError: () => void;
}

export const useDashboard = (options: UseDashboardOptions = {}): UseDashboardReturn => {
  const { 
    enabled = true, 
    refetchInterval = 30000, // 30 seconds
    autoRefresh = true 
  } = options;

  // State for all dashboard data
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [performanceChart, setPerformanceChart] = useState<PerformanceChartData[] | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistributionData[] | null>(null);
  const [technicianUtilization, setTechnicianUtilization] = useState<TechnicianUtilizationData[] | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[] | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[] | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[] | null>(null);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[] | null>(null);
  const [workOrderTrends, setWorkOrderTrends] = useState<WorkOrderTrends | null>(null);
  const [customerSatisfaction, setCustomerSatisfaction] = useState<CustomerSatisfaction | null>(null);
  const [equipmentHealth, setEquipmentHealth] = useState<EquipmentHealth | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch KPIs
  const fetchKPIs = useCallback(async () => {
    if (!enabled) return;

    try {
      const response: ApiResponse<{ kpis: DashboardKPIs }> = await DashboardService.getDashboardKPIs();
      
      if (response.success && response.data) {
        setKpis(response.data.kpis);
      } else {
        setError(response.error?.message || 'Failed to fetch dashboard KPIs');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching dashboard KPIs');
    }
  }, [enabled]);

  // Fetch charts data
  const fetchCharts = useCallback(async () => {
    if (!enabled) return;

    try {
      const [performanceResponse, statusResponse, technicianResponse, revenueResponse] = await Promise.all([
        DashboardService.getPerformanceChart(),
        DashboardService.getStatusDistribution(),
        DashboardService.getTechnicianUtilization(),
        DashboardService.getRevenueChart(),
      ]);

      if (performanceResponse.success && performanceResponse.data) {
        setPerformanceChart(performanceResponse.data.data);
      }

      if (statusResponse.success && statusResponse.data) {
        setStatusDistribution(statusResponse.data.data);
      }

      if (technicianResponse.success && technicianResponse.data) {
        setTechnicianUtilization(technicianResponse.data.data);
      }

      if (revenueResponse.success && revenueResponse.data) {
        setRevenueChart(revenueResponse.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching chart data');
    }
  }, [enabled]);

  // Fetch activities and alerts
  const fetchActivities = useCallback(async () => {
    if (!enabled) return;

    try {
      const [activitiesResponse, alertsResponse, inventoryResponse] = await Promise.all([
        DashboardService.getRecentActivities(),
        DashboardService.getSystemAlerts(),
        DashboardService.getInventoryAlerts(),
      ]);

      if (activitiesResponse.success && activitiesResponse.data) {
        setRecentActivities(activitiesResponse.data.activities);
      }

      if (alertsResponse.success && alertsResponse.data) {
        setSystemAlerts(alertsResponse.data.alerts);
      }

      if (inventoryResponse.success && inventoryResponse.data) {
        setInventoryAlerts(inventoryResponse.data.alerts);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching activities and alerts');
    }
  }, [enabled]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!enabled) return;

    try {
      const [trendsResponse, satisfactionResponse, healthResponse, costResponse, productivityResponse] = await Promise.all([
        DashboardService.getWorkOrderTrends(),
        DashboardService.getCustomerSatisfaction(),
        DashboardService.getEquipmentHealth(),
        DashboardService.getCostAnalysis(),
        DashboardService.getProductivityMetrics(),
      ]);

      if (trendsResponse.success && trendsResponse.data) {
        setWorkOrderTrends(trendsResponse.data.trends);
      }

      if (satisfactionResponse.success && satisfactionResponse.data) {
        setCustomerSatisfaction(satisfactionResponse.data.satisfaction);
      }

      if (healthResponse.success && healthResponse.data) {
        setEquipmentHealth(healthResponse.data.health);
      }

      if (costResponse.success && costResponse.data) {
        setCostAnalysis(costResponse.data.analysis);
      }

      if (productivityResponse.success && productivityResponse.data) {
        setProductivityMetrics(productivityResponse.data.metrics);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching analytics data');
    }
  }, [enabled]);

  // Main fetch function
  const fetchDashboard = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchKPIs(),
        fetchCharts(),
        fetchActivities(),
        fetchAnalytics(),
      ]);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetchKPIs, fetchCharts, fetchActivities, fetchAnalytics]);

  // Individual refetch functions
  const refetchKPIs = useCallback(async () => {
    await fetchKPIs();
  }, [fetchKPIs]);

  const refetchCharts = useCallback(async () => {
    await fetchCharts();
  }, [fetchCharts]);

  const refetchActivities = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  const refetchAlerts = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refetchInterval && enabled) {
      const interval = setInterval(fetchDashboard, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDashboard, refetchInterval, enabled, autoRefresh]);

  return {
    kpis,
    performanceChart,
    statusDistribution,
    technicianUtilization,
    revenueChart,
    recentActivities,
    systemAlerts,
    inventoryAlerts,
    workOrderTrends,
    customerSatisfaction,
    equipmentHealth,
    costAnalysis,
    productivityMetrics,
    isLoading,
    error,
    refetch: fetchDashboard,
    refetchKPIs,
    refetchCharts,
    refetchActivities,
    refetchAlerts,
    clearError,
  };
};

// Hook for specific chart data
interface UseChartDataOptions {
  chartType: 'performance' | 'status' | 'technician' | 'revenue';
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly';
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseChartDataReturn {
  data: any[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useChartData = (options: UseChartDataOptions): UseChartDataReturn => {
  const { chartType, startDate, endDate, period, enabled = true, refetchInterval } = options;

  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      const params = { startDate, endDate, period };

      switch (chartType) {
        case 'performance':
          response = await DashboardService.getPerformanceChart(params);
          break;
        case 'status':
          response = await DashboardService.getStatusDistribution();
          break;
        case 'technician':
          response = await DashboardService.getTechnicianUtilization();
          break;
        case 'revenue':
          response = await DashboardService.getRevenueChart(params);
          break;
        default:
          throw new Error(`Unknown chart type: ${chartType}`);
      }

      if (response.success && response.data) {
        setData(response.data.data);
      } else {
        setError(response.error?.message || `Failed to fetch ${chartType} chart data`);
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while fetching ${chartType} chart data`);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, chartType, startDate, endDate, period]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchChartData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchChartData, refetchInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchChartData,
    clearError,
  };
};

// Hook for real-time updates
interface UseRealTimeUpdatesOptions {
  enabled?: boolean;
  onUpdate?: (update: any) => void;
}

interface UseRealTimeUpdatesReturn {
  isConnected: boolean;
  error: string | null;
  clearError: () => void;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}): UseRealTimeUpdatesReturn => {
  const { enabled = true, onUpdate } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let eventSource: EventSource | null = null;

    const setupEventSource = async () => {
      try {
        eventSource = await DashboardService.subscribeToUpdates();
        
        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data);
            onUpdate?.(update);
          } catch (_err) {
            console.error('Failed to parse real-time update:');
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          setError('Real-time connection failed');
        };
      } catch (err: any) {
        setError(err.message || 'Failed to establish real-time connection');
      }
    };

    setupEventSource();

    return () => {
      if (eventSource) {
        eventSource.close();
        setIsConnected(false);
      }
    };
  }, [enabled, onUpdate]);

  return {
    isConnected,
    error,
    clearError,
  };
};
