import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const reportController = new ReportController();

// Dashboard API Endpoints
// GET /api/v1/reports/dashboard-stats
router.get('/dashboard-stats', reportController.getDashboardStats);

// GET /api/v1/reports/performance-chart
router.get('/performance-chart', reportController.getPerformanceChart);

// GET /api/v1/reports/status-distribution
router.get('/status-distribution', reportController.getStatusDistribution);

// GET /api/v1/reports/technician-utilization
router.get('/technician-utilization', reportController.getTechnicianUtilization);

// GET /api/v1/reports/revenue-chart
router.get('/revenue-chart', reportController.getRevenueChart);

// GET /api/v1/reports/recent-activities
router.get('/recent-activities', reportController.getRecentActivities);

// GET /api/v1/reports/system-alerts
router.get('/system-alerts', reportController.getSystemAlerts);

// GET /api/v1/reports/inventory-alerts
router.get('/inventory-alerts', reportController.getInventoryAlerts);

// Legacy Dashboard Endpoint (for backward compatibility)
// GET /api/v1/reports/dashboard
router.get('/dashboard', reportController.getDashboardData);

// GET /api/v1/reports/work-orders
router.get('/work-orders', reportController.getWorkOrderReport);

// GET /api/v1/reports/technician-performance
router.get('/technician-performance', reportController.getTechnicianPerformanceReport);

// GET /api/v1/reports/inventory
router.get('/inventory', reportController.getInventoryReport);

// GET /api/v1/reports/financial
router.get('/financial', reportController.getFinancialReport);

// GET /api/v1/reports/customer
router.get('/customer', reportController.getCustomerReport);

// GET /api/v1/reports/warranty
router.get('/warranty', reportController.getWarrantyReport);

// GET /api/v1/reports/kpi
router.get('/kpi', reportController.getKPIReport);

// GET /api/v1/reports/export/:type
router.get('/export/:type', reportController.exportReport);

export default router;
