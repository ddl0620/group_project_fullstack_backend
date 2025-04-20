import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createInvitationSchema, getInvitationsByEventIdSchema } from '../validation/invitation.validation';
import { createRSVPSchema } from '../validation/rsvp.validation';

const invitationRoutes = Router();
const controller = new InvitationController();

// Tạo lời mời mới: POST /invitations
invitationRoutes.post(
    '/invitations',
    authenticationToken,
    validateRequest(createInvitationSchema),
    controller.createInvitation
);

// Lấy danh sách lời mời của user: GET /invitations
invitationRoutes.get(
    '/invitations',
    authenticationToken,
    controller.getInvitations
);

// Lấy lời mời theo ID: GET /invitations/:id
invitationRoutes.get(
    '/invitations/:id',
    authenticationToken,
    controller.getInvitationById
);

// Xóa lời mời: DELETE /invitations/:id
invitationRoutes.delete(
    '/invitations/:id',
    authenticationToken,
    controller.deleteInvitation
);

// Tạo RSVP: POST /invitations/:invitationId/rsvp
invitationRoutes.post(
    '/invitations/:invitationId/rsvp',
    authenticationToken,
    validateRequest(createRSVPSchema),
    controller.createRSVP
);

// Lấy danh sách RSVP của user: GET /rsvps
invitationRoutes.get(
    '/rsvps',
    authenticationToken,
    controller.getRSVPs
);

// Lấy RSVP theo ID: GET /rsvps/:id
invitationRoutes.get(
    '/rsvps/:id',
    authenticationToken,
    controller.getRSVPById
);

// Xóa RSVP: DELETE /rsvps/:id
invitationRoutes.delete(
    '/rsvps/:id',
    authenticationToken,
    controller.deleteRSVP
);

// Lấy danh sách lời mời theo eventId (organizer only): GET /invitations/event
invitationRoutes.get(
    '/invitations/event',
    authenticationToken,
    validateRequest(getInvitationsByEventIdSchema, 'query'),
    controller.getInvitationsByEventId
);

export default invitationRoutes;