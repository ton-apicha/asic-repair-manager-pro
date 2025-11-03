// Common types and interfaces

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
  };
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Status Enums
export enum WorkOrderStatus {
  TRIAGE = 'TRIAGE',
  QUOTATION = 'QUOTATION',
  EXECUTION = 'EXECUTION',
  QA = 'QA',
  CLOSURE = 'CLOSURE',
  WARRANTY = 'WARRANTY',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  REPAIR = 'REPAIR',
  RETIRED = 'RETIRED',
}

export enum PartStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  DEFECTIVE = 'DEFECTIVE',
  RETIRED = 'RETIRED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  USER = 'USER',
}

export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum WarrantyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  VOID = 'VOID',
}

// Utility types
export type StatusColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'multiselect';
  options?: SelectOption[];
  placeholder?: string;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'datetime' | 'checkbox' | 'radio';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
}

// Chart types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// Search and filter types
export interface SearchFilters {
  [key: string]: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// API Error types
export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
  field?: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

// Modal/Dialog types
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
  spacing: number;
}
