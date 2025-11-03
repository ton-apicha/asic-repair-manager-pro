import { Router } from 'express';
import { DeviceController } from '../controllers/DeviceController';
import { validateRequest } from '../middleware/validateRequest';
import { 
  createDeviceSchema, 
  updateDeviceSchema,
  quickCreateDeviceSchema
} from '../utils/validationSchemas';

const router = Router();
const deviceController = new DeviceController();

// GET /api/v1/devices
router.get('/', deviceController.getAllDevices);

// GET /api/v1/devices/:id
router.get('/:id', deviceController.getDeviceById);

// POST /api/v1/devices/quick-create
router.post('/quick-create', validateRequest(quickCreateDeviceSchema), deviceController.quickCreateDevice);

// POST /api/v1/devices
router.post('/', validateRequest(createDeviceSchema), deviceController.createDevice);

// PUT /api/v1/devices/:id
router.put('/:id', validateRequest(updateDeviceSchema), deviceController.updateDevice);

// DELETE /api/v1/devices/:id
router.delete('/:id', deviceController.deleteDevice);

// GET /api/v1/devices/serial/:serialNumber
router.get('/serial/:serialNumber', deviceController.getDeviceBySerialNumber);

// GET /api/v1/devices/:id/work-orders
router.get('/:id/work-orders', deviceController.getDeviceWorkOrders);

// GET /api/v1/devices/:id/warranties
router.get('/:id/warranties', deviceController.getDeviceWarranties);

// POST /api/v1/devices/:id/warranty
router.post('/:id/warranty', deviceController.createWarranty);

// GET /api/v1/devices/stats/summary
router.get('/stats/summary', deviceController.getStatsSummary);

export default router;
