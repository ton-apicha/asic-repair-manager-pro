import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';
import { validateRequest } from '../middleware/validateRequest';
import { 
  createScheduleSchema, 
  updateScheduleSchema 
} from '../utils/validationSchemas';

const router = Router();
const scheduleController = new ScheduleController();

// GET /api/v1/schedule
router.get('/', scheduleController.getAllSchedules);

// GET /api/v1/schedule/:id
router.get('/:id', scheduleController.getScheduleById);

// POST /api/v1/schedule
router.post('/', validateRequest(createScheduleSchema), scheduleController.createSchedule);

// PUT /api/v1/schedule/:id
router.put('/:id', validateRequest(updateScheduleSchema), scheduleController.updateSchedule);

// DELETE /api/v1/schedule/:id
router.delete('/:id', scheduleController.deleteSchedule);

// GET /api/v1/schedule/technician/:technicianId
router.get('/technician/:technicianId', scheduleController.getTechnicianSchedule);

// GET /api/v1/schedule/date/:date
router.get('/date/:date', scheduleController.getScheduleByDate);

// GET /api/v1/schedule/range
router.get('/range', scheduleController.getScheduleByRange);

// POST /api/v1/schedule/:id/start
router.post('/:id/start', scheduleController.startSchedule);

// POST /api/v1/schedule/:id/complete
router.post('/:id/complete', scheduleController.completeSchedule);

// POST /api/v1/schedule/:id/cancel
router.post('/:id/cancel', scheduleController.cancelSchedule);

// GET /api/v1/schedule/conflicts
router.get('/conflicts', scheduleController.checkConflicts);

// GET /api/v1/schedule/availability
router.get('/availability', scheduleController.getAvailability);

// GET /api/v1/schedule/stats/summary
router.get('/stats/summary', scheduleController.getStatsSummary);

export default router;
