import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { validateRequest } from '../middleware/validateRequest';
import { 
  createCustomerSchema, 
  updateCustomerSchema,
  quickCreateCustomerSchema
} from '../utils/validationSchemas';

const router = Router();
const customerController = new CustomerController();

// GET /api/v1/customers
router.get('/', customerController.getAllCustomers);

// GET /api/v1/customers/:id
router.get('/:id', customerController.getCustomerById);

// POST /api/v1/customers/quick-create
router.post('/quick-create', validateRequest(quickCreateCustomerSchema), customerController.quickCreateCustomer);

// POST /api/v1/customers
router.post('/', validateRequest(createCustomerSchema), customerController.createCustomer);

// PUT /api/v1/customers/:id
router.put('/:id', validateRequest(updateCustomerSchema), customerController.updateCustomer);

// DELETE /api/v1/customers/:id
router.delete('/:id', customerController.deleteCustomer);

// GET /api/v1/customers/:id/work-orders
router.get('/:id/work-orders', customerController.getCustomerWorkOrders);

// GET /api/v1/customers/:id/devices
router.get('/:id/devices', customerController.getCustomerDevices);

// GET /api/v1/customers/:id/history
router.get('/:id/history', customerController.getCustomerHistory);

// POST /api/v1/customers/:id/communications
router.post('/:id/communications', customerController.sendCommunication);

// GET /api/v1/customers/:id/communications
router.get('/:id/communications', customerController.getCommunications);

// GET /api/v1/customers/stats/summary
router.get('/stats/summary', customerController.getStatsSummary);

export default router;
