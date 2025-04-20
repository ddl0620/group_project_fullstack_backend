import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { InvitationService } from '../services/invitation.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import Joi from 'joi';
import {HttpError} from "../helpers/httpsError.helpers";

export class InvitationController {
    private createInvitationSchema = Joi.object({
        content: Joi.string().optional().allow(''),
        eventId: Joi.string().required(),
        inviteeId: Joi.string().required(),
    });


    private createRSVPSchema = Joi.object({
        response: Joi.string()
            .valid('PENDING', 'ACCEPTED', 'DENIED')
            .required(),
    });

    private getInvitationsByEventIdSchema = Joi.object({
        eventId: Joi.string().required(),
        page: Joi.number().integer().min(1).optional().default(1),
        limit: Joi.number().integer().min(1).optional().default(10),
        sortBy: Joi.string().valid('asc', 'desc').optional().default('desc'),
    });


    /**
     * Create a new invitation
     */
    async createInvitation(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const invitation = await InvitationService.createInvitation(req.user.userId, req.body);
            HttpResponse.sendYES(res, 201, 'Invitation created successfully', { invitation });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get list of invitations for the authenticated user
     */
    async getInvitations(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await InvitationService.getInvitations(req.user.userId, page, limit, sortBy);
            HttpResponse.sendYES(res, 200, 'Invitations fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get an invitation by ID
     */
    async getInvitationById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            if (!req.params.id) {
                throw new HttpError('Missing invitation ID', 400, 'MISSING_INVITATION_ID');
            }

            const invitation = await InvitationService.getInvitationById(req.user.userId, req.params.id);
            HttpResponse.sendYES(res, 200, 'Invitation found successfully', { invitation });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Delete an invitation
     */
    async deleteInvitation(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            if (!req.params.id) {
                throw new HttpError('Missing invitation ID', 400, 'MISSING_INVITATION_ID');
            }

            const deletedInvitation = await InvitationService.deleteInvitation(req.user.userId, req.params.id);
            HttpResponse.sendYES(res, 200, 'Invitation deleted successfully', { invitation: deletedInvitation });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Create an RSVP for an invitation
     */
    async createRSVP(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            if (!req.params.invitationId) {
                throw new HttpError('Missing invitation ID', 400, 'MISSING_INVITATION_ID');
            }

            const { error } = this.createRSVPSchema.validate(req.body);
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const rsvp = await InvitationService.createRSVP(req.user.userId, req.params.invitationId, req.body);
            HttpResponse.sendYES(res, 201, 'RSVP created successfully', { rsvp });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get list of RSVPs for the authenticated user
     */
    async getRSVPs(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await InvitationService.getRSVPs(req.user.userId, page, limit, sortBy);
            HttpResponse.sendYES(res, 200, 'RSVPs fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get an RSVP by ID
     */
    async getRSVPById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            if (!req.params.id) {
                throw new HttpError('Missing RSVP ID', 400, 'MISSING_RSVP_ID');
            }

            const rsvp = await InvitationService.getRSVPById(req.user.userId, req.params.id);
            HttpResponse.sendYES(res, 200, 'RSVP found successfully', { rsvp });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Delete an RSVP
     */
    async deleteRSVP(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            if (!req.params.id) {
                throw new HttpError('Missing RSVP ID', 400, 'MISSING_RSVP_ID');
            }

            const deletedRSVP = await InvitationService.deleteRSVP(req.user.userId, req.params.id);
            HttpResponse.sendYES(res, 200, 'RSVP deleted successfully', { rsvp: deletedRSVP });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get list of invitations sent for a specific event (organizer only)
     */
    async getInvitationsByEventId(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const { error } = this.getInvitationsByEventIdSchema.validate(req.query);
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const { eventId, page, limit, sortBy } = req.query as {
                eventId: string;
                page: string;
                limit: string;
                sortBy: string;
            };

            const result = await InvitationService.getInvitationsByEventId(
                req.user.userId,
                eventId,
                parseInt(page) || 1,
                parseInt(limit) || 10,
                sortBy || 'desc'
            );
            HttpResponse.sendYES(res, 200, 'Invitations fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }
}