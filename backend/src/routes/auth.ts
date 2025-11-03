import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, registerSchema } from '../utils/validationSchemas';

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/register
router.post('/register', validateRequest(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', validateRequest(loginSchema), authController.login);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refreshToken);

// GET /api/v1/auth/me
router.get('/me', authController.getProfile);

// PUT /api/v1/auth/me
router.put('/me', authController.updateProfile);

// POST /api/v1/auth/change-password
router.post('/change-password', authController.changePassword);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', authController.resetPassword);

export default router;
