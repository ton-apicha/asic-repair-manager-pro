import { Router } from 'express';
import { TechnicianController } from '../controllers/TechnicianController';
import { validateRequest } from '../middleware/validateRequest';
import { 
  createTechnicianSchema, 
  updateTechnicianSchema 
} from '../utils/validationSchemas';

const router = Router();
const technicianController = new TechnicianController();

// GET /api/v1/technicians
router.get('/', technicianController.getAllTechnicians);

// GET /api/v1/technicians/:id
router.get('/:id', technicianController.getTechnicianById);

// POST /api/v1/technicians
router.post('/', validateRequest(createTechnicianSchema), technicianController.createTechnician);

// PUT /api/v1/technicians/:id
router.put('/:id', validateRequest(updateTechnicianSchema), technicianController.updateTechnician);

// DELETE /api/v1/technicians/:id
router.delete('/:id', technicianController.deleteTechnician);

// GET /api/v1/technicians/:id/work-orders
router.get('/:id/work-orders', technicianController.getTechnicianWorkOrders);

// GET /api/v1/technicians/:id/schedule
router.get('/:id/schedule', technicianController.getTechnicianSchedule);

// GET /api/v1/technicians/:id/time-logs
router.get('/:id/time-logs', technicianController.getTechnicianTimeLogs);

// POST /api/v1/technicians/:id/time-logs
router.post('/:id/time-logs', technicianController.createTimeLog);

// PUT /api/v1/technicians/:id/time-logs/:logId
router.put('/:id/time-logs/:logId', technicianController.updateTimeLog);

// GET /api/v1/technicians/:id/performance
router.get('/:id/performance', technicianController.getTechnicianPerformance);

// GET /api/v1/technicians/stats/summary
router.get('/stats/summary', technicianController.getStatsSummary);

export default router;
