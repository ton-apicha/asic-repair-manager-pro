import { useState, useEffect, useCallback } from 'react';
import { WorkOrderService } from '../services/workOrderService';
import { WorkOrder, WorkOrderFilters } from '../types/workOrder';
import { PaginatedResponse, ApiResponse, PaginationParams } from '../types/common';

interface UseWorkOrdersOptions extends WorkOrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseWorkOrdersReturn {
  workOrders: WorkOrder[];
  pagination: PaginatedResponse<WorkOrder>['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFilters: (filters: Partial<WorkOrderFilters>) => void;
  updatePagination: (pagination: Partial<PaginationParams>) => void;
  clearError: () => void;
}

export const useWorkOrders = (options: UseWorkOrdersOptions = {}): UseWorkOrdersReturn => {
  const {
    enabled = true,
    refetchInterval,
    page = 1,
    limit = 20,
    search,
    status,
    priority,
    technicianId,
    customerId,
    deviceId,
    startDate,
    endDate,
    createdBy,
    sortBy,
    sortOrder = 'desc',
  } = options;

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<WorkOrder>['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search,
        status,
        priority,
        technicianId,
        customerId,
        deviceId,
        startDate,
        endDate,
        createdBy,
        sortBy,
        sortOrder,
      };

      const response: ApiResponse<PaginatedResponse<WorkOrder>> = await WorkOrderService.getWorkOrders(params);
      
      if (response.success && response.data) {
        setWorkOrders(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Failed to fetch work orders');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching work orders');
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    page,
    limit,
    search,
    status,
    priority,
    technicianId,
    customerId,
    deviceId,
    startDate,
    endDate,
    createdBy,
    sortBy,
    sortOrder,
  ]);

  const updateFilters = useCallback((_filters: Partial<WorkOrderFilters>) => {
    // This would typically update the parent component's state
    // For now, we'll just refetch with new filters
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const updatePagination = useCallback((_pagination: Partial<PaginationParams>) => {
    // This would typically update the parent component's state
    // For now, we'll just refetch with new pagination
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchWorkOrders, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWorkOrders, refetchInterval, enabled]);

  return {
    workOrders,
    pagination,
    isLoading,
    error,
    refetch: fetchWorkOrders,
    updateFilters,
    updatePagination,
    clearError,
  };
};

// Hook for single work order
interface UseWorkOrderOptions {
  id: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseWorkOrderReturn {
  workOrder: WorkOrder | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useWorkOrder = (options: UseWorkOrderOptions): UseWorkOrderReturn => {
  const { id, enabled = true, refetchInterval } = options;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrder = useCallback(async () => {
    if (!enabled || !id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<{ workOrder: WorkOrder }> = await WorkOrderService.getWorkOrderById(id);
      
      if (response.success && response.data) {
        setWorkOrder(response.data.workOrder);
      } else {
        setError(response.error?.message || 'Failed to fetch work order');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching work order');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchWorkOrder();
  }, [fetchWorkOrder]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchWorkOrder, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWorkOrder, refetchInterval, enabled]);

  return {
    workOrder,
    isLoading,
    error,
    refetch: fetchWorkOrder,
    clearError,
  };
};

// Hook for work order statistics
interface UseWorkOrderStatsOptions {
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseWorkOrderStatsReturn {
  stats: any | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useWorkOrderStats = (options: UseWorkOrderStatsOptions = {}): UseWorkOrderStatsReturn => {
  const { startDate, endDate, enabled = true, refetchInterval } = options;

  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await WorkOrderService.getStatsSummary({ startDate, endDate });
      
      if (response.success && response.data) {
        setStats(response.data.stats);
      } else {
        setError(response.error?.message || 'Failed to fetch work order statistics');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching work order statistics');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, startDate, endDate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchStats, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refetchInterval, enabled]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
    clearError,
  };
};

// Hook for technician performance
interface UseTechnicianPerformanceOptions {
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseTechnicianPerformanceReturn {
  performance: any[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useTechnicianPerformance = (options: UseTechnicianPerformanceOptions = {}): UseTechnicianPerformanceReturn => {
  const { startDate, endDate, enabled = true, refetchInterval } = options;

  const [performance, setPerformance] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await WorkOrderService.getTechnicianPerformance({ startDate, endDate });
      
      if (response.success && response.data) {
        setPerformance(response.data.performance);
      } else {
        setError(response.error?.message || 'Failed to fetch technician performance');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching technician performance');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, startDate, endDate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchPerformance, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPerformance, refetchInterval, enabled]);

  return {
    performance,
    isLoading,
    error,
    refetch: fetchPerformance,
    clearError,
  };
};
