import { Router } from 'express';
import { adminOnlyMiddleware, authenticationToken } from '../../middlewares/auth.middleware';
import { EventManagementController } from '../../controllers/admin/eventManagement.controller';
import upload from '../../uploads/multer.config';

const AdminEventRouter = Router();

AdminEventRouter.get(
    '/',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.getAllEvents,
);

AdminEventRouter.post(
    '/:userId',
    authenticationToken,
    adminOnlyMiddleware,
    upload.array('images', 10),
    EventManagementController.createNewEvent,
);

AdminEventRouter.put(
    '/:eventId',
    authenticationToken,
    adminOnlyMiddleware,
    upload.array('images', 10),
    EventManagementController.updateEvent,
);

AdminEventRouter.put(
    '/active/:eventId',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.updateActiveStatus,
);

AdminEventRouter.get(
    '/:id',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.getAllEventByUserId,
);

export default AdminEventRouter;
