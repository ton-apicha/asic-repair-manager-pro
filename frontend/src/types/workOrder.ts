import { WorkOrderStatus, Priority } from './common';
// Re-export for convenience
export type { PaginationParams, PaginatedResponse } from './common';

// Work Order Types
export interface WorkOrder {
  id: string;
  woId: string;
  customerId: string;
  deviceId: string;
  technicianId?: string;
  status: WorkOrderStatus;
  priority: Priority;
  description?: string;
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  updatedBy?: string;

  // Relations
  customer?: Customer;
  device?: Device;
  technician?: Technician;
  diagnostics?: Diagnostic[];
  partsUsage?: PartsUsage[];
  timeLogs?: TimeLog[];
  documents?: WorkOrderDocument[];
  warranties?: Warranty[];
}

export interface WorkOrderCreate {
  customerId: string;
  deviceId: string;
  description: string;
  priority?: Priority;
}

export interface WorkOrderUpdate {
  customerId?: string;
  deviceId?: string;
  technicianId?: string;
  status?: WorkOrderStatus;
  priority?: Priority;
  description?: string;
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface WorkOrderFilters {
  search?: string;
  status?: WorkOrderStatus;
  priority?: Priority;
  technicianId?: string;
  customerId?: string;
  deviceId?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
}

// Diagnostic Types
export interface Diagnostic {
  id: string;
  workOrderId: string;
  faultType: string;
  faultDescription?: string;
  diagnosisNotes?: string;
  recommendedParts: string[];
  estimatedRepairTime?: number; // minutes
  createdAt: string;
  createdBy: string;
}

export interface DiagnosticCreate {
  faultType: string;
  faultDescription?: string;
  diagnosisNotes?: string;
  recommendedParts: string[];
  estimatedRepairTime?: number;
}

// Parts Usage Types
export interface PartsUsage {
  id: string;
  workOrderId: string;
  partId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  usedAt: string;
  usedBy: string;

  // Relations
  part?: Part;
}

export interface PartsUsageCreate {
  partId: string;
  quantity: number;
  unitCost: number;
}

// Time Log Types
export interface TimeLog {
  id: string;
  workOrderId: string;
  technicianId: string;
  activityType: string;
  startTime: string;
  endTime?: string;
  duration?: number; // minutes
  hourlyRate?: number;
  totalCost?: number;
  notes?: string;
  createdAt: string;

  // Relations
  technician?: Technician;
}

export interface TimeLogCreate {
  activityType: string;
  startTime: string;
  endTime?: string;
  hourlyRate?: number;
  notes?: string;
}

// Work Order Document Types
export interface WorkOrderDocument {
  id: string;
  workOrderId: string;
  documentType: string;
  filePath: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WorkOrderDocumentCreate {
  documentType: string;
  file: File;
}

// Work Order Stats Types
export interface WorkOrderStats {
  totalWorkOrders: number;
  completedWorkOrders: number;
  inProgressWorkOrders: number;
  pendingWorkOrders: number;
  completionRate: number;
  averageCompletionTime: number; // hours
  averageCost: number;
  totalRevenue: number;
}

export interface TechnicianPerformance {
  id: string;
  employeeId: string;
  name: string;
  totalWorkOrders: number;
  completedWorkOrders: number;
  totalHours: number;
  totalCost: number;
  averageCompletionTime: number;
  firstTimeFixRate: number;
}

// Work Order Timeline Types
export interface WorkOrderTimeline {
  woId: string;
  status: WorkOrderStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  diagnostics: Array<{
    faultType: string;
    createdAt: string;
  }>;
  timeLogs: Array<{
    activityType: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    technician: {
      firstName: string;
      lastName: string;
    };
  }>;
}

// Status Update Types
export interface StatusUpdate {
  status: WorkOrderStatus;
  notes?: string;
}

// Technician Assignment Types
export interface TechnicianAssignment {
  technicianId: string;
  notes?: string;
}

// Import related types (will be defined in other files)
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

export interface Technician {
  id: string;
  userId: string;
  employeeId: string;
  skills: string[];
  hourlyRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Part {
  id: string;
  categoryId: string;
  partNumber: string;
  serialNumber?: string;
  model?: string;
  cost: number;
  sellingPrice?: number;
  quantityInStock: number;
  minStockLevel: number;
  location?: string;
  supplier?: string;
  purchaseDate?: string;
  warrantyPeriod?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
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
