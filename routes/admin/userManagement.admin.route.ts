import { Router } from 'express';
import { UserManagementController } from '../../controllers/admin/userManagement.controller';
import { adminOnlyMiddleware, authenticationToken } from '../../middlewares/auth.middleware';

const UserRouter = Router();

UserRouter.get('/', authenticationToken, adminOnlyMiddleware, UserManagementController.getAllUsers);
UserRouter.put(
    '/:id',
    authenticationToken,
    adminOnlyMiddleware,
    UserManagementController.updateUserInformation,
);

UserRouter.delete(
    '/:id',
    authenticationToken,
    adminOnlyMiddleware,
    UserManagementController.deleteUser,
);

export default UserRouter;
