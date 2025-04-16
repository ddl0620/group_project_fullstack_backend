import { Router } from 'express';
import { authenticationToken } from '../middlewares/auth.middleware';
import { onlySelf } from '../middlewares/oneUser.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {updateUserSchema} from "../validation/user.validation";
import {UserController} from "../controllers/user.controllers";

const userRoutes = Router();
const controller = new UserController();

userRoutes.get('/me', authenticationToken, controller.me);
userRoutes.put('/:id', authenticationToken, onlySelf, validateRequest(updateUserSchema), controller.updateInfor);
userRoutes.get('/me', authenticationToken, controller.me);
userRoutes.get('/all', authenticationToken, controller.getAllUsers);
userRoutes.put('/:id', authenticationToken, onlySelf, validateRequest(updateUserSchema), controller.updateInfor);
userRoutes.delete('/:id', authenticationToken, onlySelf, controller.deleteUser);
export default userRoutes;