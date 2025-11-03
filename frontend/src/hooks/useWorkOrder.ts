import { useState, useEffect, useCallback } from 'react';
import { WorkOrderService } from '../services/workOrderService';
import { WorkOrder } from '../types/workOrder';
import { ApiResponse } from '../types/common';

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

  useEffect(() => {
    fetchWorkOrder();
  }, [fetchWorkOrder]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchWorkOrder, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWorkOrder, refetchInterval, enabled]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    workOrder,
    isLoading,
    error,
    refetch: fetchWorkOrder,
    clearError,
  };
};

