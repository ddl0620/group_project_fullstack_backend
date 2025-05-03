import { Router } from 'express';
import { adminOnlyMiddleware, authenticationToken } from '../../middlewares/auth.middleware';
import { EventManagementController } from '../../controllers/admin/eventManagement.controller';
import upload from '../../uploads/multer.config';

const EventRouter = Router();

EventRouter.get(
    '/',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.getAllEvents,
);

EventRouter.post(
    '/:userId',
    authenticationToken,
    adminOnlyMiddleware,
    upload.array('images', 10),
    EventManagementController.createNewEvent,
);

EventRouter.put(
    '/:eventId',
    authenticationToken,
    adminOnlyMiddleware,
    upload.array('images', 10),
    EventManagementController.updateEvent,
);

EventRouter.put(
    '/active/:eventId',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.updateActiveStatus,
);

EventRouter.get(
    '/:id',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.getAllEventByUserId,
);

export default EventRouter;
