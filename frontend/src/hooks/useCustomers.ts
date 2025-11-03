import { useState, useEffect, useCallback } from 'react';
import { CustomerService } from '../services/customerService';
import { Customer, CustomerFilters, CustomerStats, CustomerQuickCreate } from '../types/customer';
import { PaginatedResponse, ApiResponse, PaginationParams } from '../types/common';

interface UseCustomersOptions extends PaginationParams, CustomerFilters {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseCustomersReturn {
  customers: Customer[];
  pagination: PaginatedResponse<Customer>['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFilters: (filters: Partial<CustomerFilters>) => void;
  updatePagination: (pagination: Partial<PaginationParams>) => void;
  clearError: () => void;
}

export const useCustomers = (options: UseCustomersOptions = {}): UseCustomersReturn => {
  const {
    enabled = true,
    refetchInterval,
    page = 1,
    limit = 20,
    search,
    isActive,
    hasDevices,
    hasWorkOrders,
    sortBy,
    sortOrder = 'desc',
  } = options;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Customer>['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search,
        isActive,
        hasDevices,
        hasWorkOrders,
        sortBy,
        sortOrder,
      };

      const response: ApiResponse<PaginatedResponse<Customer>> = await CustomerService.getCustomers(params);
      
      if (response.success && response.data) {
        setCustomers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Failed to fetch customers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching customers');
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    page,
    limit,
    search,
    isActive,
    hasDevices,
    hasWorkOrders,
    sortBy,
    sortOrder,
  ]);

  const updateFilters = useCallback((_filters: Partial<CustomerFilters>) => {
    // This would typically update the parent component's state
    // For now, we'll just refetch with new filters
    fetchCustomers();
  }, [fetchCustomers]);

  const updatePagination = useCallback((_pagination: Partial<PaginationParams>) => {
    // This would typically update the parent component's state
    // For now, we'll just refetch with new pagination
    fetchCustomers();
  }, [fetchCustomers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchCustomers, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchCustomers, refetchInterval, enabled]);

  return {
    customers,
    pagination,
    isLoading,
    error,
    refetch: fetchCustomers,
    updateFilters,
    updatePagination,
    clearError,
  };
};

// Hook for single customer
interface UseCustomerOptions {
  id: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseCustomerReturn {
  customer: Customer | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useCustomer = (options: UseCustomerOptions): UseCustomerReturn => {
  const { id, enabled = true, refetchInterval } = options;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!enabled || !id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<{ customer: Customer }> = await CustomerService.getCustomerById(id);
      
      if (response.success && response.data) {
        setCustomer(response.data.customer);
      } else {
        setError(response.error?.message || 'Failed to fetch customer');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching customer');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchCustomer, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchCustomer, refetchInterval, enabled]);

  return {
    customer,
    isLoading,
    error,
    refetch: fetchCustomer,
    clearError,
  };
};

// Hook for customer statistics
interface UseCustomerStatsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseCustomerStatsReturn {
  stats: CustomerStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useCustomerStats = (options: UseCustomerStatsOptions = {}): UseCustomerStatsReturn => {
  const { enabled = true, refetchInterval } = options;

  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await CustomerService.getCustomerStats();
      
      if (response.success && response.data) {
        setStats(response.data.stats);
      } else {
        setError(response.error?.message || 'Failed to fetch customer statistics');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching customer statistics');
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

// Hook for customer search
interface UseCustomerSearchOptions {
  query: string;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseCustomerSearchReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useCustomerSearch = (options: UseCustomerSearchOptions): UseCustomerSearchReturn => {
  const { query, enabled = true, debounceMs = 300 } = options;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCustomers = useCallback(async (searchQuery: string) => {
    if (!enabled || !searchQuery.trim()) {
      setCustomers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await CustomerService.searchCustomers(searchQuery);
      
      if (response.success && response.data) {
        setCustomers(response.data.customers);
      } else {
        setError(response.error?.message || 'Failed to search customers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching customers');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomers(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchCustomers, debounceMs]);

  return {
    customers,
    isLoading,
    error,
    clearError,
  };
};

// Hook for customer devices
interface UseCustomerDevicesOptions {
  customerId: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseCustomerDevicesReturn {
  devices: any[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useCustomerDevices = (options: UseCustomerDevicesOptions): UseCustomerDevicesReturn => {
  const { customerId, enabled = true, refetchInterval } = options;

  const [devices, setDevices] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    if (!enabled || !customerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await CustomerService.getCustomerDevices(customerId);
      
      if (response.success && response.data) {
        setDevices(response.data.devices);
      } else {
        setError(response.error?.message || 'Failed to fetch customer devices');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching customer devices');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, customerId]);

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
    isLoading,
    error,
    refetch: fetchDevices,
    clearError,
  };
};

// Hook for quick create customer
export const useQuickCreateCustomer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickCreateCustomer = useCallback(async (data: CustomerQuickCreate): Promise<Customer | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CustomerService.quickCreateCustomer(data);
      if (response.success && response.data) {
        return response.data.customer;
      } else {
        setError(response.error?.message || 'Failed to create customer');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating customer');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    quickCreateCustomer,
    isLoading,
    error,
    clearError,
  };
};
