import { apiClient } from './apiClient';
import { 
  Technician, 
  TechnicianCreate, 
  TechnicianUpdate, 
  TechnicianFilters,
  TechnicianStats,
  TechnicianPerformance,
  WorkSchedule,
  WorkScheduleCreate,
  WorkScheduleUpdate,
  TimeLog,
  TimeLogCreate,
  TechnicianSkill,
  TechnicianSkillCreate,
  TechnicianAvailability,
  TechnicianAvailabilityCreate,
  TechnicianWorkload,
  TechnicianCalendarEvent,
  PaginatedResponse
} from '../types/technician';
import { ApiResponse, PaginationParams } from '../types/common';

export class TechnicianService {
  // Technician CRUD
  static async getTechnicians(params: PaginationParams & TechnicianFilters = {}): Promise<ApiResponse<PaginatedResponse<Technician>>> {
    const response = await apiClient.get('/technicians', { params });
    return response.data;
  }

  static async getTechnicianById(id: string): Promise<ApiResponse<{ technician: Technician }>> {
    const response = await apiClient.get(`/technicians/${id}`);
    return response.data;
  }

  static async createTechnician(data: TechnicianCreate): Promise<ApiResponse<{ technician: Technician }>> {
    const response = await apiClient.post('/technicians', data);
    return response.data;
  }

  static async updateTechnician(id: string, data: TechnicianUpdate): Promise<ApiResponse<{ technician: Technician }>> {
    const response = await apiClient.put(`/technicians/${id}`, data);
    return response.data;
  }

  static async deleteTechnician(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/technicians/${id}`);
    return response.data;
  }

  // Technician Statistics
  static async getTechnicianStats(): Promise<ApiResponse<{ stats: TechnicianStats }>> {
    const response = await apiClient.get('/technicians/stats');
    return response.data;
  }

  // Technician Performance
  static async getTechnicianPerformance(technicianId: string, params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ performance: TechnicianPerformance }>> {
    const response = await apiClient.get(`/technicians/${technicianId}/performance`, { params });
    return response.data;
  }

  static async getAllTechnicianPerformance(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ performance: TechnicianPerformance[] }>> {
    const response = await apiClient.get('/technicians/performance', { params });
    return response.data;
  }

  // Work Schedule
  static async getTechnicianSchedule(technicianId: string, params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ schedule: WorkSchedule[] }>> {
    const response = await apiClient.get(`/technicians/${technicianId}/schedule`, { params });
    return response.data;
  }

  static async createWorkSchedule(data: WorkScheduleCreate): Promise<ApiResponse<{ schedule: WorkSchedule }>> {
    const response = await apiClient.post('/technicians/schedule', data);
    return response.data;
  }

  static async updateWorkSchedule(scheduleId: string, data: WorkScheduleUpdate): Promise<ApiResponse<{ schedule: WorkSchedule }>> {
    const response = await apiClient.put(`/technicians/schedule/${scheduleId}`, data);
    return response.data;
  }

  static async deleteWorkSchedule(scheduleId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/technicians/schedule/${scheduleId}`);
    return response.data;
  }

  // Time Logs
  static async getTechnicianTimeLogs(technicianId: string, params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<TimeLog>>> {
    const response = await apiClient.get(`/technicians/${technicianId}/time-logs`, { params });
    return response.data;
  }

  static async createTimeLog(data: TimeLogCreate): Promise<ApiResponse<{ timeLog: TimeLog }>> {
    const response = await apiClient.post('/technicians/time-logs', data);
    return response.data;
  }

  static async updateTimeLog(timeLogId: string, data: Partial<TimeLogCreate>): Promise<ApiResponse<{ timeLog: TimeLog }>> {
    const response = await apiClient.put(`/technicians/time-logs/${timeLogId}`, data);
    return response.data;
  }

  static async deleteTimeLog(timeLogId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/technicians/time-logs/${timeLogId}`);
    return response.data;
  }

  // Skills Management
  static async getTechnicianSkills(technicianId: string): Promise<ApiResponse<{ skills: TechnicianSkill[] }>> {
    const response = await apiClient.get(`/technicians/${technicianId}/skills`);
    return response.data;
  }

  static async addTechnicianSkill(technicianId: string, data: TechnicianSkillCreate): Promise<ApiResponse<{ skill: TechnicianSkill }>> {
    const response = await apiClient.post(`/technicians/${technicianId}/skills`, data);
    return response.data;
  }

  static async updateTechnicianSkill(technicianId: string, skillId: string, data: Partial<TechnicianSkillCreate>): Promise<ApiResponse<{ skill: TechnicianSkill }>> {
    const response = await apiClient.put(`/technicians/${technicianId}/skills/${skillId}`, data);
    return response.data;
  }

  static async deleteTechnicianSkill(technicianId: string, skillId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/technicians/${technicianId}/skills/${skillId}`);
    return response.data;
  }

  // Availability Management
  static async getTechnicianAvailability(technicianId: string, params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ availability: TechnicianAvailability[] }>> {
    const response = await apiClient.get(`/technicians/${technicianId}/availability`, { params });
    return response.data;
  }

  static async setTechnicianAvailability(technicianId: string, data: TechnicianAvailabilityCreate): Promise<ApiResponse<{ availability: TechnicianAvailability }>> {
    const response = await apiClient.post(`/technicians/${technicianId}/availability`, data);
    return response.data;
  }

  static async updateTechnicianAvailability(technicianId: string, availabilityId: string, data: Partial<TechnicianAvailabilityCreate>): Promise<ApiResponse<{ availability: TechnicianAvailability }>> {
    const response = await apiClient.put(`/technicians/${technicianId}/availability/${availabilityId}`, data);
    return response.data;
  }

  static async deleteTechnicianAvailability(technicianId: string, availabilityId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/technicians/${technicianId}/availability/${availabilityId}`);
    return response.data;
  }

  // Workload Management
  static async getTechnicianWorkload(technicianId: string): Promise<ApiResponse<{ workload: TechnicianWorkload }>> {
    const response = await apiClient.get(`/technicians/${technicianId}/workload`);
    return response.data;
  }

  static async getAllTechnicianWorkloads(): Promise<ApiResponse<{ workloads: TechnicianWorkload[] }>> {
    const response = await apiClient.get('/technicians/workloads');
    return response.data;
  }

  // Calendar
  static async getTechnicianCalendar(technicianId: string, params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ events: TechnicianCalendarEvent[] }>> {
    const response = await apiClient.get(`/technicians/${technicianId}/calendar`, { params });
    return response.data;
  }

  static async getAllTechnicianCalendars(params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ events: TechnicianCalendarEvent[] }>> {
    const response = await apiClient.get('/technicians/calendars', { params });
    return response.data;
  }

  // Search and Filter
  static async searchTechnicians(query: string): Promise<ApiResponse<{ technicians: Technician[] }>> {
    const response = await apiClient.get('/technicians/search', { 
      params: { q: query, limit: 10 } 
    });
    return response.data;
  }

  static async getTechniciansBySkill(skill: string): Promise<ApiResponse<{ technicians: Technician[] }>> {
    const response = await apiClient.get('/technicians', { 
      params: { skills: skill } 
    });
    return response.data;
  }

  static async getAvailableTechnicians(params: { startDate?: string; endDate?: string; skills?: string[] } = {}): Promise<ApiResponse<{ technicians: Technician[] }>> {
    const response = await apiClient.get('/technicians/available', { params });
    return response.data;
  }

  // Analytics
  static async getTechnicianAnalytics(technicianId: string, params: { startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{
    totalWorkOrders: number;
    completedWorkOrders: number;
    totalHours: number;
    totalRevenue: number;
    averageCompletionTime: number;
    firstTimeFixRate: number;
    customerSatisfaction: number;
    skills: string[];
    performanceTrend: Array<{ date: string; workOrders: number; hours: number; revenue: number }>;
  }>> {
    const response = await apiClient.get(`/technicians/${technicianId}/analytics`, { params });
    return response.data;
  }

  // Export
  static async exportTechnicians(params: TechnicianFilters = {}): Promise<Blob> {
    const response = await apiClient.get('/technicians/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Helper Methods
  static buildFilters(params: TechnicianFilters): Record<string, any> {
    const filters: Record<string, any> = {};

    if (params.search) filters.search = params.search;
    if (params.skills) filters.skills = params.skills;
    if (params.isActive !== undefined) filters.isActive = params.isActive;
    if (params.hasWorkOrders !== undefined) filters.hasWorkOrders = params.hasWorkOrders;
    if (params.hourlyRateMin !== undefined) filters.hourlyRateMin = params.hourlyRateMin;
    if (params.hourlyRateMax !== undefined) filters.hourlyRateMax = params.hourlyRateMax;

    return filters;
  }

  // Validation
  static validateTechnicianData(data: TechnicianCreate): string[] {
    const errors: string[] = [];

    if (!data.userId?.trim()) {
      errors.push('User is required');
    }

    if (!data.employeeId?.trim()) {
      errors.push('Employee ID is required');
    }

    if (!data.skills || data.skills.length === 0) {
      errors.push('At least one skill is required');
    }

    if (data.hourlyRate && data.hourlyRate < 0) {
      errors.push('Hourly rate must be positive');
    }

    return errors;
  }

  // Status helpers
  static getTechnicianStatusColor(isActive: boolean): string {
    return isActive ? '#4caf50' : '#757575';
  }

  static getTechnicianStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  // Skill level helpers
  static getSkillLevelColor(level: string): string {
    const colors: Record<string, string> = {
      beginner: '#f44336',
      intermediate: '#ff9800',
      advanced: '#2196f3',
      expert: '#4caf50',
    };
    return colors[level] || '#757575';
  }

  static getSkillLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    };
    return labels[level] || level;
  }

  // Utilization helpers
  static getUtilizationColor(rate: number): string {
    if (rate >= 90) return '#f44336'; // Red - Overutilized
    if (rate >= 75) return '#ff9800'; // Orange - High utilization
    if (rate >= 50) return '#4caf50'; // Green - Good utilization
    if (rate >= 25) return '#2196f3'; // Blue - Low utilization
    return '#757575'; // Gray - Very low utilization
  }

  static getUtilizationLabel(rate: number): string {
    if (rate >= 90) return 'Overutilized';
    if (rate >= 75) return 'High';
    if (rate >= 50) return 'Good';
    if (rate >= 25) return 'Low';
    return 'Very Low';
  }

  // Format helpers
  static formatTechnicianName(technician: Technician): string {
    if (technician.user) {
      return `${technician.user.firstName} ${technician.user.lastName}`;
    }
    return `Technician ${technician.employeeId}`;
  }

  static getTechnicianInitials(technician: Technician): string {
    if (technician.user) {
      return `${technician.user.firstName.charAt(0)}${technician.user.lastName.charAt(0)}`.toUpperCase();
    }
    return technician.employeeId.slice(0, 2).toUpperCase();
  }

  // Performance helpers
  static calculateEfficiency(workOrders: number, hours: number): number {
    if (hours === 0) return 0;
    return Math.round((workOrders / hours) * 100) / 100;
  }

  static calculateFirstTimeFixRate(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }
}
