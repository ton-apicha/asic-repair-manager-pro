import { Router } from 'express';
import { WorkOrderController } from '../controllers/WorkOrderController';
import { validateRequest } from '../middleware/validateRequest';
import Joi from 'joi';
import { 
  createWorkOrderSchema, 
  updateWorkOrderSchema,
  createDiagnosticSchema,
  createPartsUsageSchema,
  createTimeLogSchema,
  updateTimeLogSchema,
} from '../utils/validationSchemas';

const router = Router();
const workOrderController = new WorkOrderController();

// GET /api/v1/work-orders
router.get('/', workOrderController.getAllWorkOrders);

// GET /api/v1/work-orders/:id
router.get('/:id', workOrderController.getWorkOrderById);

// POST /api/v1/work-orders
router.post('/', validateRequest(createWorkOrderSchema), workOrderController.createWorkOrder);

// PUT /api/v1/work-orders/:id
router.put('/:id', validateRequest(updateWorkOrderSchema), workOrderController.updateWorkOrder);

// DELETE /api/v1/work-orders/:id
router.delete('/:id', workOrderController.deleteWorkOrder);

// POST /api/v1/work-orders/:id/diagnostics
router.post('/:id/diagnostics', validateRequest(createDiagnosticSchema), workOrderController.createDiagnostic);

// GET /api/v1/work-orders/:id/diagnostics
router.get('/:id/diagnostics', workOrderController.getDiagnostics);

// POST /api/v1/work-orders/:id/status
router.post('/:id/status', workOrderController.updateStatus);

// POST /api/v1/work-orders/:id/assign
router.post('/:id/assign', validateRequest(Joi.object({
  technicianId: Joi.string().allow('', null).optional(),
  notes: Joi.string().max(1000).optional(),
})), workOrderController.assignTechnician);

// GET /api/v1/work-orders/:id/timeline
router.get('/:id/timeline', workOrderController.getTimeline);

// POST /api/v1/work-orders/:id/documents
router.post('/:id/documents', workOrderController.uploadDocument);

// GET /api/v1/work-orders/:id/documents
router.get('/:id/documents', workOrderController.getDocuments);

// GET /api/v1/work-orders/stats/summary
router.get('/stats/summary', workOrderController.getStatsSummary);

// GET /api/v1/work-orders/stats/technician-performance
router.get('/stats/technician-performance', workOrderController.getTechnicianPerformance);

// Parts Usage routes
// POST /api/v1/work-orders/:id/parts
router.post('/:id/parts', validateRequest(createPartsUsageSchema), workOrderController.addPartsUsage);

// GET /api/v1/work-orders/:id/parts
router.get('/:id/parts', workOrderController.getPartsUsage);

// DELETE /api/v1/work-orders/:id/parts/:partUsageId
router.delete('/:id/parts/:partUsageId', workOrderController.deletePartsUsage);

// Time Logs routes
// POST /api/v1/work-orders/:id/time-logs
router.post('/:id/time-logs', validateRequest(createTimeLogSchema), workOrderController.addTimeLog);

// GET /api/v1/work-orders/:id/time-logs
router.get('/:id/time-logs', workOrderController.getTimeLogs);

// PUT /api/v1/work-orders/:id/time-logs/:logId
router.put('/:id/time-logs/:logId', validateRequest(updateTimeLogSchema), workOrderController.updateTimeLog);

// DELETE /api/v1/work-orders/:id/time-logs/:logId
router.delete('/:id/time-logs/:logId', workOrderController.deleteTimeLog);

export default router;
