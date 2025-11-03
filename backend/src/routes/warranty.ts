import { Router } from 'express';
import { WarrantyController } from '../controllers/WarrantyController';
import { validateRequest } from '../middleware/validateRequest';
import { 
  createWarrantySchema, 
  updateWarrantySchema,
  createWarrantyTypeSchema 
} from '../utils/validationSchemas';

const router = Router();
const warrantyController = new WarrantyController();

// GET /api/v1/warranty
router.get('/', warrantyController.getAllWarranties);

// GET /api/v1/warranty/:id
router.get('/:id', warrantyController.getWarrantyById);

// POST /api/v1/warranty
router.post('/', validateRequest(createWarrantySchema), warrantyController.createWarranty);

// PUT /api/v1/warranty/:id
router.put('/:id', validateRequest(updateWarrantySchema), warrantyController.updateWarranty);

// DELETE /api/v1/warranty/:id
router.delete('/:id', warrantyController.deleteWarranty);

// GET /api/v1/warranty/device/:deviceId
router.get('/device/:deviceId', warrantyController.getDeviceWarranties);

// GET /api/v1/warranty/work-order/:workOrderId
router.get('/work-order/:workOrderId', warrantyController.getWorkOrderWarranties);

// GET /api/v1/warranty/expiring
router.get('/expiring', warrantyController.getExpiringWarranties);

// POST /api/v1/warranty/:id/claim
router.post('/:id/claim', warrantyController.createWarrantyClaim);

// GET /api/v1/warranty/:id/claims
router.get('/:id/claims', warrantyController.getWarrantyClaims);

// GET /api/v1/warranty/stats/summary
router.get('/stats/summary', warrantyController.getStatsSummary);

// Warranty Types
// GET /api/v1/warranty/types
router.get('/types', warrantyController.getAllWarrantyTypes);

// POST /api/v1/warranty/types
router.post('/types', validateRequest(createWarrantyTypeSchema), warrantyController.createWarrantyType);

// PUT /api/v1/warranty/types/:id
router.put('/types/:id', warrantyController.updateWarrantyType);

// DELETE /api/v1/warranty/types/:id
router.delete('/types/:id', warrantyController.deleteWarrantyType);

export default router;
