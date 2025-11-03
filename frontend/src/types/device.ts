import { DeviceStatus } from './common';
// Re-export for convenience
export type { PaginationParams, PaginatedResponse } from './common';

// Device Types
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
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;

  // Relations
  customer?: Customer;
  workOrders?: WorkOrder[];
  warranties?: Warranty[];
}

export interface DeviceCreate {
  customerId: string;
  model: string;
  serialNumber: string;
  hashrate?: number;
  powerConsumption?: number;
  purchaseDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
}

export interface DeviceUpdate {
  model?: string;
  serialNumber?: string;
  hashrate?: number;
  powerConsumption?: number;
  purchaseDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  status?: DeviceStatus;
}

export interface DeviceQuickCreate {
  customerId: string;
  model: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
}

export interface DeviceFilters {
  search?: string;
  status?: DeviceStatus;
  model?: string;
  customerId?: string;
  hasWarranty?: boolean;
  warrantyExpiring?: boolean;
  hasWorkOrders?: boolean;
}

// Device Stats Types
export interface DeviceStats {
  totalDevices: number;
  activeDevices: number;
  repairDevices: number;
  retiredDevices: number;
  devicesUnderWarranty: number;
  devicesOutOfWarranty: number;
  averageHashrate: number;
  totalPowerConsumption: number;
}

// Device Performance Metrics
export interface DevicePerformance {
  id: string;
  model: string;
  serialNumber: string;
  hashrate: number;
  powerConsumption: number;
  efficiency: number; // TH/s per Watt
  uptime: number; // percentage
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  totalRepairs: number;
  averageRepairTime: number; // hours
  totalRepairCost: number;
}

// Device Repair History
export interface DeviceRepairHistory {
  id: string;
  woId: string;
  status: string;
  priority: string;
  description?: string;
  faultType?: string;
  repairDate: string;
  completedDate?: string;
  technician?: string;
  totalCost?: number;
  partsUsed: string[];
  duration: number; // hours
}

// Device Warranty Information
export interface DeviceWarrantyInfo {
  id: string;
  deviceId: string;
  warrantyType: string;
  startDate: string;
  endDate: string;
  status: string;
  terms?: string;
  coverage: {
    parts: boolean;
    labor: boolean;
    shipping: boolean;
  };
  remainingDays: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // within 30 days
}

// Device Health Check
export interface DeviceHealthCheck {
  id: string;
  deviceId: string;
  checkDate: string;
  performedBy: string;
  results: {
    hashrate: number;
    powerConsumption: number;
    temperature: number;
    fanSpeed: number;
    errorRate: number;
    uptime: number;
  };
  issues: Array<{
    type: 'warning' | 'error' | 'critical';
    message: string;
    recommendation?: string;
  }>;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  nextCheckDate: string;
}

export interface DeviceHealthCheckCreate {
  results: {
    hashrate: number;
    powerConsumption: number;
    temperature: number;
    fanSpeed: number;
    errorRate: number;
    uptime: number;
  };
  issues: Array<{
    type: 'warning' | 'error' | 'critical';
    message: string;
    recommendation?: string;
  }>;
  nextCheckDate: string;
}

// Device Maintenance Schedule
export interface DeviceMaintenance {
  id: string;
  deviceId: string;
  type: 'preventive' | 'corrective' | 'emergency';
  scheduledDate: string;
  performedDate?: string;
  performedBy?: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  cost?: number;
  partsUsed: string[];
}

export interface DeviceMaintenanceCreate {
  type: 'preventive' | 'corrective' | 'emergency';
  scheduledDate: string;
  description: string;
  notes?: string;
  partsUsed: string[];
}

// Device Model Information
export interface DeviceModel {
  id: string;
  name: string;
  manufacturer: string;
  specifications: {
    hashrate: number;
    powerConsumption: number;
    efficiency: number;
    algorithm: string;
    releaseDate: string;
  };
  commonIssues: string[];
  recommendedMaintenance: {
    interval: number; // days
    tasks: string[];
  };
  warrantyPeriod: number; // days
  isActive: boolean;
}

// Import related types
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

export interface Warranty {
  id: string;
  workOrderId: string;
  deviceId: string;
  warrantyTypeId: string;
  startDate: string;
  endDate: string;
  terms?: string;
  status: string;
  createdAt: string;
}
