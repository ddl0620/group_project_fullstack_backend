import { Router } from 'express';
import { AuthControllers } from '../controllers/auth.controllers';

const router = Router();
const authController = new AuthControllers();

router.post('/sign-in', authController.signIn);
router.post('/sign-up', authController.signUp);
router.post('/verify-sign-up', authController.verifySignUp);

router.post('/send-verification', authController.sendVerification);
router.post('/verification', authController.verifyCode);


export default router;
