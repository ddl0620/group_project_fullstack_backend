import { Router } from 'express';
import { AuthControllers } from '../controllers/auth.controllers';

/**
 * Authentication Router
 *
 * This router handles all authentication-related operations including
 * user registration, login, and account verification processes.
 * These routes are public endpoints that don't require prior authentication.
 */
const router = Router();
const authController = new AuthControllers();

/**
 * POST /auth/sign-in
 *
 * Authenticates a user and generates access credentials
 *
 * @controller authController.signIn - Handles user authentication
 * @body {Object} credentials - User login credentials (typically email/username and password)
 *
 * @returns {Object} Authentication result containing tokens and user information
 */
router.post('/sign-in', authController.signIn);

/**
 * POST /auth/sign-up
 *
 * Registers a new user in the system
 *
 * @controller authController.signUp - Handles user registration
 * @body {Object} userData - New user details (name, email, password, etc.)
 *
 * @returns {Object} Registration result, typically including verification requirements
 */
router.post('/sign-up', authController.signUp);
router.post('/verify-sign-up', authController.verifySignUp);
router.post('/send-verification', authController.sendVerification);
router.post('/verification', authController.verifyCode);
router.post('/sign-out', authController.signOut);

/**
 * Commented endpoint for sending verification codes
 * Currently disabled but preserved for potential future use
 *
 * POST /auth/send-verification
 * @controller authController.sendVerification - Sends verification codes to users
 */
// router.post('/send-verification', authController.sendVerification);

export default router;
