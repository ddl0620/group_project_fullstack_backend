import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { adminOnlyMiddleware, authenticationToken } from '../middlewares/auth.middleware';

/**
 * Authentication Router
 *
 * This router handles all authentication-related operations including
 * user registration, login, and account verification processes.
 * These routes are public endpoints that don't require prior authentication.
 */
const router = Router();

router.post('/', FeedbackController.createFeedback);
router.get('/', authenticationToken, adminOnlyMiddleware, FeedbackController.getAllFeedback);

export default router;
