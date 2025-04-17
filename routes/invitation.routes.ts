import { Router, Request, Response, NextFunction } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";
import {createInvitationSchema} from "../validation/invitation.validation";
import {createRSVPSchema} from "../validation/rsvp.validation";


// Định nghĩa kiểu cho middleware
type Middleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => void;

// Định nghĩa kiểu cho handler đã được bảo vệ bởi authenticationToken
type AuthenticatedHandler = (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => Promise<void>;

const invitationRoutes = Router();
const controller = new InvitationController();

// Tạo lời mời mới: POST /invitations
invitationRoutes.post(
    '/invitations',
    authenticationToken as Middleware,
    validateRequest(createInvitationSchema),
    controller.createInvitation as unknown as AuthenticatedHandler
);

// Lấy danh sách lời mời của user: GET /invitations
invitationRoutes.get(
    '/invitations',
    authenticationToken as Middleware,
    controller.getInvitations as unknown as AuthenticatedHandler
);

// Lấy lời mời theo ID: GET /invitations/:id
invitationRoutes.get(
    '/invitations/:id',
    authenticationToken as Middleware,
    controller.getInvitationById as unknown as AuthenticatedHandler
);

// Xóa lời mời: DELETE /invitations/:id
invitationRoutes.delete(
    '/invitations/:id',
    authenticationToken as Middleware,
    controller.deleteInvitation as unknown as AuthenticatedHandler
);

// Tạo RSVP: POST /invitations/:invitationId/rsvp
invitationRoutes.post(
    '/invitations/:invitationId/rsvp',
    authenticationToken as Middleware,
    validateRequest(createRSVPSchema),
    controller.createRSVP as unknown as AuthenticatedHandler
);

// Lấy danh sách RSVP của user: GET /rsvps
invitationRoutes.get(
    '/rsvps',
    authenticationToken as Middleware,
    controller.getRSVPs as unknown as AuthenticatedHandler
);

// Lấy RSVP theo ID: GET /rsvps/:id
invitationRoutes.get(
    '/rsvps/:id',
    authenticationToken as Middleware,
    controller.getRSVPById as unknown as AuthenticatedHandler
);

// Xóa RSVP: DELETE /rsvps/:id
invitationRoutes.delete(
    '/rsvps/:id',
    authenticationToken as Middleware,
    controller.deleteRSVP as unknown as AuthenticatedHandler
);

export default invitationRoutes;