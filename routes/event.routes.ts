import { Router} from 'express';
import { EventController } from '../controllers/event.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
    createEventSchema,
    joinEventSchema,
    respondEventSchema,
    updateEventSchema
} from "../validation/event.validation";

const eventRoutes = Router();
const event = new EventController();

eventRoutes.post('/add-event', authenticationToken, validateRequest(createEventSchema), event.addEvent);
eventRoutes.get('/all-event', authenticationToken, event.getAllEvent);
eventRoutes.get('/joined', authenticationToken, event.getJoinedEvent);
eventRoutes.get('/my', authenticationToken, event.getMyEvent);

eventRoutes.post('/:eventId/join', authenticationToken, validateRequest(joinEventSchema), event.joinEvent);
eventRoutes.post('/:eventId/respond-join', authenticationToken, validateRequest(respondEventSchema), event.respondEvent);
eventRoutes.get('/:id', authenticationToken, event.getEventById);
eventRoutes.put('/:id', authenticationToken, validateRequest(updateEventSchema), event.updateEvent);
eventRoutes.delete('/:id', authenticationToken, event.deleteEvent);

export default eventRoutes;