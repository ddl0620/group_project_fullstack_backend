import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
    createInvitationSchema,
    getInvitationsByEventIdSchema,
} from '../validation/invitation.validation';

const invitationRoutes = Router();
const controller = new InvitationController();

invitationRoutes.post(
    '/invitations',
    authenticationToken,
    validateRequest(createInvitationSchema),
    controller.createInvitation,
);

invitationRoutes.get('/received', authenticationToken, controller.getAllReceivedInvitations);

invitationRoutes.get(
    '/invitations/event',
    authenticationToken,
    validateRequest(getInvitationsByEventIdSchema, 'query'),
    controller.getInvitationsByEventId,
);

invitationRoutes.get(
    '/received/:eventId',
    authenticationToken,
    controller.getReceivedInvitationByEventId,
);

invitationRoutes.get('/rsvps', authenticationToken, controller.getRSVPs);

invitationRoutes.get('/invitations/:id', authenticationToken, controller.getInvitationById);

invitationRoutes.delete('/invitations/:id', authenticationToken, controller.deleteInvitation);

invitationRoutes.post('/rsvp/:invitationId', authenticationToken, controller.createRSVP);

invitationRoutes.get('/rsvps/:id', authenticationToken, controller.getRSVPById);

invitationRoutes.delete('/rsvps/:id', authenticationToken, controller.deleteRSVP);

invitationRoutes.get(
    '/invitations/:invitationId/rsvp',
    authenticationToken,
    controller.getRSVPByInvitationId,
);

export default invitationRoutes;
