import { Router } from 'express';
import { UserManagementController } from '../../controllers/admin/userManagement.controller';
import { adminOnlyMiddleware, authenticationToken } from '../../middlewares/auth.middleware';
import { EventManagementController } from '../../controllers/admin/eventManagement.controller';

const EventRouter = Router();

EventRouter.get(
    '/',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.getAllEvents,
);
EventRouter.get(
    '/:id',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.getAllEventByUserId,
);

export default EventRouter;
