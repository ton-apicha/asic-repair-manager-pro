import { useState, useEffect, useCallback } from 'react';
import { DeviceService } from '../services/deviceService';
import { Device, DeviceFilters, DeviceStats, DevicePerformance, DeviceQuickCreate } from '../types/device';
import { PaginatedResponse, ApiResponse, PaginationParams } from '../types/common';

interface UseDevicesOptions extends PaginationParams, DeviceFilters {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseDevicesReturn {
  devices: Device[];
  pagination: PaginatedResponse<Device>['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFilters: (filters: Partial<DeviceFilters>) => void;
  updatePagination: (pagination: Partial<PaginationParams>) => void;
  clearError: () => void;
}

export const useDevices = (options: UseDevicesOptions = {}): UseDevicesReturn => {
  const {
    enabled = true,
    refetchInterval,
    page = 1,
    limit = 20,
    search,
    status,
    model,
    customerId,
    hasWarranty,
    warrantyExpiring,
    hasWorkOrders,
    sortBy,
    sortOrder = 'desc',
  } = options;

  const [devices, setDevices] = useState<Device[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Device>['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search,
        status,
        model,
        customerId,
        hasWarranty,
        warrantyExpiring,
        hasWorkOrders,
        sortBy,
        sortOrder,
      };

      const response: ApiResponse<PaginatedResponse<Device>> = await DeviceService.getDevices(params);
      
      if (response.success && response.data) {
        setDevices(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Failed to fetch devices');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching devices');
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    page,
    limit,
    search,
    status,
    model,
    customerId,
    hasWarranty,
    warrantyExpiring,
    hasWorkOrders,
    sortBy,
    sortOrder,
  ]);

  const updateFilters = useCallback((_filters: Partial<DeviceFilters>) => {
    // This would typically update the parent component's state
    // For now, we'll just refetch with new filters
    fetchDevices();
  }, [fetchDevices]);

  const updatePagination = useCallback((_pagination: Partial<PaginationParams>) => {
    // This would typically update the parent component's state
    // For now, we'll just refetch with new pagination
    fetchDevices();
  }, [fetchDevices]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchDevices, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDevices, refetchInterval, enabled]);

  return {
    devices,
    pagination,
    isLoading,
    error,
    refetch: fetchDevices,
    updateFilters,
    updatePagination,
    clearError,
  };
};

// Hook for single device
interface UseDeviceOptions {
  id: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseDeviceReturn {
  device: Device | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useDevice = (options: UseDeviceOptions): UseDeviceReturn => {
  const { id, enabled = true, refetchInterval } = options;

  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevice = useCallback(async () => {
    if (!enabled || !id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<{ device: Device }> = await DeviceService.getDeviceById(id);
      
      if (response.success && response.data) {
        setDevice(response.data.device);
      } else {
        setError(response.error?.message || 'Failed to fetch device');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching device');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchDevice, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDevice, refetchInterval, enabled]);

  return {
    device,
    isLoading,
    error,
    refetch: fetchDevice,
    clearError,
  };
};

// Hook for device statistics
interface UseDeviceStatsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseDeviceStatsReturn {
  stats: DeviceStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useDeviceStats = (options: UseDeviceStatsOptions = {}): UseDeviceStatsReturn => {
  const { enabled = true, refetchInterval } = options;

  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await DeviceService.getDeviceStats();
      
      if (response.success && response.data) {
        setStats(response.data.stats);
      } else {
        setError(response.error?.message || 'Failed to fetch device statistics');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching device statistics');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

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

// Hook for device performance
interface UseDevicePerformanceOptions {
  deviceId?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseDevicePerformanceReturn {
  performance: DevicePerformance | DevicePerformance[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useDevicePerformance = (options: UseDevicePerformanceOptions = {}): UseDevicePerformanceReturn => {
  const { deviceId, enabled = true, refetchInterval } = options;

  const [performance, setPerformance] = useState<DevicePerformance | DevicePerformance[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (deviceId) {
        response = await DeviceService.getDevicePerformance(deviceId);
        if (response.success && response.data) {
          setPerformance(response.data.performance);
        }
      } else {
        response = await DeviceService.getAllDevicePerformance();
        if (response.success && response.data) {
          setPerformance(response.data.performance);
        }
      }

      if (!response.success) {
        setError(response.error?.message || 'Failed to fetch device performance');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching device performance');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, deviceId]);

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

// Hook for device search
interface UseDeviceSearchOptions {
  query: string;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseDeviceSearchReturn {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useDeviceSearch = (options: UseDeviceSearchOptions): UseDeviceSearchReturn => {
  const { query, enabled = true, debounceMs = 300 } = options;

  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDevices = useCallback(async (searchQuery: string) => {
    if (!enabled || !searchQuery.trim()) {
      setDevices([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await DeviceService.searchDevices(searchQuery);
      
      if (response.success && response.data) {
        setDevices(response.data.devices);
      } else {
        setError(response.error?.message || 'Failed to search devices');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching devices');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchDevices(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchDevices, debounceMs]);

  return {
    devices,
    isLoading,
    error,
    clearError,
  };
};

// Hook for warranty information
interface UseWarrantyInfoOptions {
  deviceId?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseWarrantyInfoReturn {
  warranty: any | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useWarrantyInfo = (options: UseWarrantyInfoOptions = {}): UseWarrantyInfoReturn => {
  const { deviceId, enabled = true, refetchInterval } = options;

  const [warranty, setWarranty] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWarranty = useCallback(async () => {
    if (!enabled || !deviceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await DeviceService.getDeviceWarrantyInfo(deviceId);
      
      if (response.success && response.data) {
        setWarranty(response.data.warranty);
      } else {
        setError(response.error?.message || 'Failed to fetch warranty information');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching warranty information');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, deviceId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchWarranty();
  }, [fetchWarranty]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchWarranty, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWarranty, refetchInterval, enabled]);

  return {
    warranty,
    isLoading,
    error,
    refetch: fetchWarranty,
    clearError,
  };
};

// Hook for quick create device
export const useQuickCreateDevice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickCreateDevice = useCallback(async (data: DeviceQuickCreate): Promise<Device | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await DeviceService.quickCreateDevice(data);
      if (response.success && response.data) {
        return response.data.device;
      } else {
        setError(response.error?.message || 'Failed to create device');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating device');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    quickCreateDevice,
    isLoading,
    error,
    clearError,
  };
};
