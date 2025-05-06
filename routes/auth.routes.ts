import { Router } from 'express';
import { validateRequest } from '../middlewares/validation.middleware';
import { AuthControllers } from '../controllers/auth.controllers';
import { signInSchema, signUpSchema } from '../validation/auth.validation';

const router = Router();
const authController = new AuthControllers();

router.post('/sign-in', authController.signIn);
router.post('/sign-up', authController.signUp);

export default router;
