import { Router } from 'express';
import { PartsController } from '../controllers/PartsController';
import { validateRequest } from '../middleware/validateRequest';
import { 
  createPartSchema, 
  updatePartSchema,
  createPartCategorySchema 
} from '../utils/validationSchemas';

const router = Router();
const partsController = new PartsController();

// GET /api/v1/parts
router.get('/', partsController.getAllParts);

// GET /api/v1/parts/:id
router.get('/:id', partsController.getPartById);

// POST /api/v1/parts
router.post('/', validateRequest(createPartSchema), partsController.createPart);

// PUT /api/v1/parts/:id
router.put('/:id', validateRequest(updatePartSchema), partsController.updatePart);

// DELETE /api/v1/parts/:id
router.delete('/:id', partsController.deletePart);

// GET /api/v1/parts/serial/:serialNumber
router.get('/serial/:serialNumber', partsController.getPartBySerialNumber);

// GET /api/v1/parts/category/:categoryId
router.get('/category/:categoryId', partsController.getPartsByCategory);

// POST /api/v1/parts/:id/issue
router.post('/:id/issue', partsController.issuePart);

// POST /api/v1/parts/:id/return
router.post('/:id/return', partsController.returnPart);

// GET /api/v1/parts/:id/usage-history
router.get('/:id/usage-history', partsController.getPartUsageHistory);

// GET /api/v1/parts/low-stock
router.get('/low-stock', partsController.getLowStockParts);

// POST /api/v1/parts/stock-adjustment
router.post('/stock-adjustment', partsController.adjustStock);

// GET /api/v1/parts/stats/summary
router.get('/stats/summary', partsController.getStatsSummary);

// Part Categories
// GET /api/v1/parts/categories
router.get('/categories', partsController.getAllCategories);

// POST /api/v1/parts/categories
router.post('/categories', validateRequest(createPartCategorySchema), partsController.createCategory);

// PUT /api/v1/parts/categories/:id
router.put('/categories/:id', partsController.updateCategory);

// DELETE /api/v1/parts/categories/:id
router.delete('/categories/:id', partsController.deleteCategory);

export default router;
