import { Router } from 'express';
import { EventController } from '../controllers/event.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { joinEventSchema, respondEventSchema } from '../validation/event.validation';
import upload from '../uploads/multer.config';

const eventRoutes = Router();
const event = new EventController();

eventRoutes.post('/add-event', authenticationToken, upload.array('images', 10), event.addEvent);

eventRoutes.get('/all-event', authenticationToken, event.getAllEvent);

eventRoutes.get('/joined', authenticationToken, event.getJoinedEvent);

eventRoutes.get('/my', authenticationToken, event.getMyEvent);

eventRoutes.post(
    '/:eventId/join',
    authenticationToken,
    validateRequest(joinEventSchema),
    event.joinEvent,
);
eventRoutes.post(
    '/:eventId/respond-join',
    authenticationToken,
    validateRequest(respondEventSchema),
    event.respondEvent,
);
eventRoutes.get('/:id', authenticationToken, event.getEventById);
eventRoutes.put('/:id', authenticationToken, upload.array('images', 10), event.updateEvent);
eventRoutes.delete('/:id', authenticationToken, event.deleteEvent);

eventRoutes.patch(
    '/:eventId/is-open',
    authenticationToken,
    async (req, res, next) => {
        const eventController = new EventController();
        await eventController.updateIsOpen(req, res, next);
    },
);

export default eventRoutes;
