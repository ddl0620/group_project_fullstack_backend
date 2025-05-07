import { Router } from 'express';
import { AuthControllers } from '../controllers/auth.controllers';

const router = Router();
const authController = new AuthControllers();

router.post('/sign-in', authController.signIn);
router.post('/sign-up', authController.signUp);

export default router;
