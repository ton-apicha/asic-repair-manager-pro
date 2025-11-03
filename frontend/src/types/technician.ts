import { UserRole } from './common';
// Re-export for convenience
export type { PaginationParams, PaginatedResponse } from './common';

// Technician Types
export interface Technician {
  id: string;
  userId: string;
  employeeId: string;
  skills: string[];
  hourlyRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: User;
  workOrders?: WorkOrder[];
  timeLogs?: TimeLog[];
  schedules?: WorkSchedule[];
}

export interface TechnicianCreate {
  userId: string;
  employeeId: string;
  skills: string[];
  hourlyRate?: number;
}

export interface TechnicianUpdate {
  employeeId?: string;
  skills?: string[];
  hourlyRate?: number;
  isActive?: boolean;
}

export interface TechnicianFilters {
  search?: string;
  skills?: string[];
  isActive?: boolean;
  hasWorkOrders?: boolean;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
}

// User Types (for technician relation)
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Technician Stats Types
export interface TechnicianStats {
  totalTechnicians: number;
  activeTechnicians: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  averageCompletionTime: number; // hours
  totalHours: number;
  totalRevenue: number;
  averageHourlyRate: number;
  utilizationRate: number; // percentage
}

// Technician Performance Metrics
export interface TechnicianPerformance {
  id: string;
  employeeId: string;
  name: string;
  totalWorkOrders: number;
  completedWorkOrders: number;
  inProgressWorkOrders: number;
  totalHours: number;
  totalCost: number;
  averageCompletionTime: number; // hours
  firstTimeFixRate: number; // percentage
  customerSatisfaction: number; // rating 1-5
  skills: string[];
  hourlyRate: number;
  utilizationRate: number; // percentage
  lastActivity: string;
}

// Technician Schedule Types
export interface WorkSchedule {
  id: string;
  workOrderId: string;
  technicianId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;

  // Relations
  workOrder?: WorkOrder;
  technician?: Technician;
}

export interface WorkScheduleCreate {
  workOrderId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
}

export interface WorkScheduleUpdate {
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
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
  workOrder?: WorkOrder;
  technician?: Technician;
}

export interface TimeLogCreate {
  workOrderId: string;
  activityType: string;
  startTime: string;
  endTime?: string;
  hourlyRate?: number;
  notes?: string;
}

// Technician Skills Management
export interface TechnicianSkill {
  id: string;
  technicianId: string;
  skillName: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certifications: string[];
  lastUpdated: string;
}

export interface TechnicianSkillCreate {
  skillName: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certifications: string[];
}

// Technician Availability
export interface TechnicianAvailability {
  id: string;
  technicianId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string; // vacation, sick, training, etc.
  createdAt: string;
}

export interface TechnicianAvailabilityCreate {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

// Technician Workload
export interface TechnicianWorkload {
  technicianId: string;
  name: string;
  currentWorkOrders: number;
  scheduledHours: number;
  availableHours: number;
  utilizationRate: number; // percentage
  nextAvailableDate?: string;
  skills: string[];
  hourlyRate: number;
}

// Technician Calendar View
export interface TechnicianCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'work_order' | 'maintenance' | 'training' | 'vacation' | 'other';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  workOrderId?: string;
  description?: string;
  location?: string;
  color?: string;
}

// Import related types
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
