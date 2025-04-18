import { Router } from 'express';
import {adminOnlyMiddleware, authenticationToken} from '../middlewares/auth.middleware';
import { onlySelf } from '../middlewares/oneUser.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {updateUserSchema} from "../validation/user.validation";
import {UserController} from "../controllers/user.controllers";

const userRoutes = Router();
const controller = new UserController();

userRoutes.get('/me', authenticationToken, controller.me);
//admin only
// userRoutes.get('/all', authenticationToken, adminOnlyMiddleware, controller.getAllUsers);
userRoutes.get('/all', authenticationToken, controller.getAllUsers);

userRoutes.put('/:id', authenticationToken, onlySelf, validateRequest(updateUserSchema), controller.updateInfor);
userRoutes.delete('/:id', authenticationToken, onlySelf, controller.deleteUser);
userRoutes.get("/:id", authenticationToken, controller.getUserById);

export default userRoutes;