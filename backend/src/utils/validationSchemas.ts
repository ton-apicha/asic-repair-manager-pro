import Joi from 'joi';

// Auth validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'TECHNICIAN', 'USER').default('USER'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

// Customer validation schemas
export const createCustomerSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).required(),
  contactPerson: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(20).optional(),
  address: Joi.string().max(500).optional(),
  taxId: Joi.string().max(20).optional(),
});

export const updateCustomerSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).optional(),
  contactPerson: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(20).optional(),
  address: Joi.string().max(500).optional(),
  taxId: Joi.string().max(20).optional(),
});

export const quickCreateCustomerSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  contactPerson: Joi.string().min(2).max(255).required(),
  phone: Joi.string().min(10).max(20).required(),
  address: Joi.string().max(500).optional(),
  taxId: Joi.string().max(20).optional(),
});

// Device validation schemas
export const createDeviceSchema = Joi.object({
  customerId: Joi.string().required(),
  model: Joi.string().min(2).max(100).required(),
  serialNumber: Joi.string().min(5).max(100).required(),
  hashrate: Joi.number().positive().optional(),
  powerConsumption: Joi.number().integer().positive().optional(),
  purchaseDate: Joi.date().optional(),
  warrantyStartDate: Joi.date().optional(),
  warrantyEndDate: Joi.date().optional(),
});

export const updateDeviceSchema = Joi.object({
  model: Joi.string().min(2).max(100).optional(),
  serialNumber: Joi.string().min(5).max(100).optional(),
  hashrate: Joi.number().positive().optional(),
  powerConsumption: Joi.number().integer().positive().optional(),
  purchaseDate: Joi.date().optional(),
  warrantyStartDate: Joi.date().optional(),
  warrantyEndDate: Joi.date().optional(),
  status: Joi.string().valid('ACTIVE', 'REPAIR', 'RETIRED').optional(),
});

export const quickCreateDeviceSchema = Joi.object({
  customerId: Joi.string().required(),
  model: Joi.string().min(2).max(100).required(),
  serialNumber: Joi.string().min(5).max(100).optional(),
  purchaseDate: Joi.date().optional(),
  warrantyExpiry: Joi.date().optional(),
});

// Technician validation schemas
export const createTechnicianSchema = Joi.object({
  userId: Joi.string().required(),
  employeeId: Joi.string().min(3).max(20).required(),
  skills: Joi.array().items(Joi.string()).optional(),
  hourlyRate: Joi.number().positive().optional(),
});

export const updateTechnicianSchema = Joi.object({
  employeeId: Joi.string().min(3).max(20).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  hourlyRate: Joi.number().positive().optional(),
  isActive: Joi.boolean().optional(),
});

// Work Order validation schemas
export const createWorkOrderSchema = Joi.object({
  customerId: Joi.string().required(),
  deviceId: Joi.string().required(),
  description: Joi.string().min(1).max(1000).required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
});

export const updateWorkOrderSchema = Joi.object({
  technicianId: Joi.string().optional(),
  status: Joi.string().valid('TRIAGE', 'QUOTATION', 'EXECUTION', 'QA', 'CLOSURE', 'WARRANTY').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
  description: Joi.string().max(1000).optional(),
  notes: Joi.string().max(2000).optional(),
  estimatedCost: Joi.number().positive().optional(),
  actualCost: Joi.number().positive().optional(),
});

export const createDiagnosticSchema = Joi.object({
  faultType: Joi.string().min(2).max(100).required(),
  faultDescription: Joi.string().max(1000).optional(),
  diagnosisNotes: Joi.string().max(2000).optional(),
  recommendedParts: Joi.array().items(Joi.string()).optional(),
  estimatedRepairTime: Joi.number().integer().positive().optional(),
});

// Parts validation schemas
export const createPartSchema = Joi.object({
  categoryId: Joi.string().required(),
  partNumber: Joi.string().min(2).max(100).required(),
  serialNumber: Joi.string().min(5).max(100).optional(),
  model: Joi.string().min(2).max(100).optional(),
  cost: Joi.number().positive().required(),
  sellingPrice: Joi.number().positive().optional(),
  quantityInStock: Joi.number().integer().min(0).default(0),
  minStockLevel: Joi.number().integer().min(0).default(0),
  location: Joi.string().max(100).optional(),
  supplier: Joi.string().max(255).optional(),
  purchaseDate: Joi.date().optional(),
  warrantyPeriod: Joi.number().integer().positive().optional(),
});

export const updatePartSchema = Joi.object({
  partNumber: Joi.string().min(2).max(100).optional(),
  serialNumber: Joi.string().min(5).max(100).optional(),
  model: Joi.string().min(2).max(100).optional(),
  cost: Joi.number().positive().optional(),
  sellingPrice: Joi.number().positive().optional(),
  quantityInStock: Joi.number().integer().min(0).optional(),
  minStockLevel: Joi.number().integer().min(0).optional(),
  location: Joi.string().max(100).optional(),
  supplier: Joi.string().max(255).optional(),
  purchaseDate: Joi.date().optional(),
  warrantyPeriod: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('AVAILABLE', 'IN_USE', 'DEFECTIVE', 'RETIRED').optional(),
});

export const createPartCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
});

// Schedule validation schemas
export const createScheduleSchema = Joi.object({
  workOrderId: Joi.string().required(),
  technicianId: Joi.string().required(),
  scheduledDate: Joi.date().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().required(),
});

export const updateScheduleSchema = Joi.object({
  scheduledDate: Joi.date().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  status: Joi.string().valid('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
});

// Warranty validation schemas
export const createWarrantySchema = Joi.object({
  workOrderId: Joi.string().required(),
  deviceId: Joi.string().required(),
  warrantyTypeId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  terms: Joi.string().max(2000).optional(),
});

export const updateWarrantySchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  terms: Joi.string().max(2000).optional(),
  status: Joi.string().valid('ACTIVE', 'EXPIRED', 'VOID').optional(),
});

export const createWarrantyTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  durationDays: Joi.number().integer().positive().required(),
  coverageType: Joi.string().valid('PARTS', 'LABOR', 'BOTH').required(),
  description: Joi.string().max(500).optional(),
});

// Time Log validation schemas
export const createTimeLogSchema = Joi.object({
  activityType: Joi.string().min(2).max(50).required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().optional(),
  hourlyRate: Joi.number().positive().optional(),
  notes: Joi.string().max(1000).optional(),
});

export const updateTimeLogSchema = Joi.object({
  endTime: Joi.date().optional(),
  notes: Joi.string().max(1000).optional(),
});

// Parts Usage validation schemas
export const createPartsUsageSchema = Joi.object({
  partId: Joi.string().required(),
  quantity: Joi.number().integer().positive().required(),
  unitCost: Joi.number().positive().required(),
});

// Communication validation schemas
export const createCommunicationSchema = Joi.object({
  type: Joi.string().valid('EMAIL', 'SMS', 'PUSH').required(),
  templateId: Joi.string().optional(),
  workOrderId: Joi.string().optional(),
  variables: Joi.object().optional(),
});

// Query parameter validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const dateRangeSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

export const searchSchema = Joi.object({
  search: Joi.string().min(1).max(100).optional(),
  status: Joi.string().optional(),
  priority: Joi.string().optional(),
  technicianId: Joi.string().optional(),
  customerId: Joi.string().optional(),
});
