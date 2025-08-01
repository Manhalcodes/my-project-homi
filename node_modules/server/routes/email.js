import express from 'express';
import { verifyEmail, requestPasswordReset, resetPassword } from '../controllers/emailController.js';
import { authLimiter } from '../middleware/rateLimit.js';
const router = express.Router();

router.get('/verify-email', verifyEmail);
router.post('/request-reset', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
