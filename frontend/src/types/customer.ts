// Customer Types
// Re-export for convenience
export type { PaginationParams, PaginatedResponse } from './common';
export interface Customer {
  id: string;
  companyName: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  devices?: Device[];
  workOrders?: WorkOrder[];
}

export interface CustomerCreate {
  companyName: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface CustomerUpdate {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface CustomerQuickCreate {
  companyName: string;
  email: string;
  contactPerson: string;
  phone: string;
  address?: string;
  taxId?: string;
}

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  hasDevices?: boolean;
  hasWorkOrders?: boolean;
}

// Customer Stats Types
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalDevices: number;
  totalWorkOrders: number;
  averageWorkOrdersPerCustomer: number;
  totalRevenue: number;
  averageRevenuePerCustomer: number;
}

// Customer Device Summary
export interface CustomerDeviceSummary {
  id: string;
  model: string;
  serialNumber: string;
  status: string;
  lastRepairDate?: string;
  totalRepairs: number;
  warrantyStatus: string;
}

// Customer Work Order Summary
export interface CustomerWorkOrderSummary {
  id: string;
  woId: string;
  deviceModel: string;
  status: string;
  priority: string;
  createdAt: string;
  completedAt?: string;
  totalCost?: number;
}

// Customer Contact History
export interface CustomerContact {
  id: string;
  customerId: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject?: string;
  content: string;
  contactBy: string;
  contactDate: string;
  followUpDate?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface CustomerContactCreate {
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject?: string;
  content: string;
  followUpDate?: string;
}

// Import related types
export interface Device {
  id: string;
  customerId: string;
  model: string;
  serialNumber: string;
  hashrate?: number;
  powerConsumption?: number;
  purchaseDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  woId: string;
  customerId: string;
  deviceId: string;
  technicianId?: string;
  status: string;
  priority: string;
  description?: string;
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  updatedBy?: string;
}
