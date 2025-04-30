import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { InvitationService } from '../services/invitation.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import Joi from 'joi';
import { HttpError } from '../helpers/httpsError.helpers';
import { getInvitationsByEventIdSchema } from '../validation/invitation.validation';
import { createRSVPSchema } from '../validation/rsvp.validation';

export class InvitationController {
    private createInvitationSchema = Joi.object({
        content: Joi.string().optional().allow(''),
        eventId: Joi.string().required(),
        inviteeId: Joi.string().required(),
    });

    /**
     * Create a new invitation
     */
    async createInvitation(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
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
    async getAllReceivedInvitations(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await InvitationService.getReceivedInvitations(
                req.user.userId,
                page,
                limit,
                sortBy,
            );
            HttpResponse.sendYES(res, 200, 'Invitations fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getReceivedInvitationByEventId(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const result = await InvitationService.getReceivedInvitationById(
                req.user.userId,
                req.params.eventId,
            );
            HttpResponse.sendYES(res, 200, 'Invitations fetched successfully', {
                invitation: result,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get an invitation by ID
     */
    async getInvitationById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            if (!req.params.id) {
                throw new HttpError('Missing invitation ID', 400, 'MISSING_INVITATION_ID');
            }

            const invitation = await InvitationService.getInvitationById(
                req.user.userId,
                req.params.id,
            );
            HttpResponse.sendYES(res, 200, 'Invitation found successfully', { invitation });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Delete an invitation
     */
    async deleteInvitation(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            if (!req.params.id) {
                throw new HttpError('Missing invitation ID', 400, 'MISSING_INVITATION_ID');
            }

            const deletedInvitation = await InvitationService.deleteInvitation(
                req.user.userId,
                req.params.id,
            );
            HttpResponse.sendYES(res, 200, 'Invitation deleted successfully', {
                invitation: deletedInvitation,
            });
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

            const { error } = createRSVPSchema.validate(req.body);
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const rsvp = await InvitationService.createRSVP(
                req.user.userId,
                req.params.invitationId,
                req.body,
            );
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
    async getRSVPById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
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

    async getInvitationsByEventId(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const { error } = getInvitationsByEventIdSchema.validate(req.query);
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
                sortBy || 'desc',
            );
            console.log('Controller result:', result); // Debug
            HttpResponse.sendYES(res, 200, 'Invitations fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get RSVP for a specific invitation
     */
    async getRSVPByInvitationId(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }
            if (!req.params.invitationId) {
                throw new HttpError('Missing invitation ID', 400, 'MISSING_INVITATION_ID');
            }

            const rsvp = await InvitationService.getRSVPByInvitationId(
                req.user.userId,
                req.params.invitationId,
            );
            HttpResponse.sendYES(res, 200, 'RSVP fetched successfully', { rsvp });
        } catch (err) {
            next(err);
        }
    }
}
