import { Router } from 'express';
import { validateRequest } from '../middlewares/validation.middleware';
import { AuthControllers } from '../controllers/auth.controllers';
import {signInSchema, signUpSchema} from "../validation/auth.validation";

const router = Router();
const authController = new AuthControllers();

router.post('/sign-in', validateRequest(signInSchema), authController.signIn);
router.post('/sign-up', validateRequest(signUpSchema), authController.signUp);

export default router;