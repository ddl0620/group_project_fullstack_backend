import { Router } from 'express';
import { authenticationToken } from '../middlewares/auth.middleware';
import { onlySelf } from '../middlewares/oneUser.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { updateUserSchema } from '../validation/user.validation';
import { UserController } from '../controllers/user.controllers';
import upload from '../uploads/multer.config';

const userRoutes = Router();
const controller = new UserController();

userRoutes.get('/me', authenticationToken, controller.me);

userRoutes.put(
    '/basicInfo/:id',
    authenticationToken,
    onlySelf,
    upload.array('avatar', 1),
    controller.updateBasicInformation,
);

userRoutes.put('/password/:id', authenticationToken, onlySelf, controller.updatePassword);
userRoutes.delete('/:id', authenticationToken, onlySelf, controller.deleteUser);
userRoutes.get('/:id', authenticationToken, controller.getUserById);

export default userRoutes;
