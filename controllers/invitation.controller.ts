import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { InvitationService } from '../services/invitation.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { HttpError } from '../helpers/httpsError.helpers';
import { getInvitationsByEventIdSchema } from '../validation/invitation.validation';
import { createRSVPSchema } from '../validation/rsvp.validation';
import { validateInput } from '../helpers/validateInput';

/**
 * InvitationController
 * 
 * This controller handles all operations related to event invitations and RSVPs, including:
 * - Creating and managing invitations to events
 * - Retrieving invitations (received, sent, by event)
 * - Managing RSVPs (create, retrieve, delete)
 * - Handling invitation-specific operations for event organizers
 * 
 * All endpoints require authentication through AuthenticationRequest.
 */
export class InvitationController {
    /**
     * Creates a new invitation to an event
     * 
     * This endpoint allows an authenticated user to create a new invitation for an event,
     * typically used by event organizers to invite other users.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information and invitation data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.user.userId - ID of the authenticated user creating the invitation
     * @param {Object} req.body - Invitation details (eventId, recipientId, etc.)
     * @returns {Promise<void>} - Returns the created invitation through HttpResponse
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
     * Retrieves all invitations received by the authenticated user with pagination
     * 
     * This endpoint fetches all invitations where the authenticated user is the recipient,
     * supporting pagination and sorting options.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of invitations per page (default: 10)
     * @param {string} req.query.sortBy - Sorting direction (default: 'desc')
     * @returns {Promise<void>} - Returns paginated invitations through HttpResponse
     */
    async getAllReceivedInvitations(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await InvitationService.getReceivedInvitations(
                req.user!.userId,
                page,
                limit,
                sortBy,
            );
            HttpResponse.sendYES(res, 200, 'Invitations fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves a received invitation for a specific event
     * 
     * This endpoint fetches an invitation received by the authenticated user
     * for a specific event identified by the eventId parameter.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.eventId - ID of the event to fetch the invitation for
     * @returns {Promise<void>} - Returns the invitation through HttpResponse
     */
    async getReceivedInvitationByEventId(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const result = await InvitationService.getReceivedInvitationById(
                req.user!.userId,
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
     * Retrieves a specific invitation by its ID
     * 
     * This endpoint fetches a single invitation based on the provided invitation ID,
     * ensuring the authenticated user has permission to view it.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.id - ID of the invitation to fetch
     * @returns {Promise<void>} - Returns the requested invitation through HttpResponse
     */
    async getInvitationById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const invitation = await InvitationService.getInvitationById(
                req.user!.userId,
                req.params.id,
            );
            HttpResponse.sendYES(res, 200, 'Invitation found successfully', { invitation });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Deletes an invitation
     * 
     * This endpoint allows a user to delete an invitation they've created or received,
     * depending on the service implementation's permission checks.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.id - ID of the invitation to delete
     * @returns {Promise<void>} - Returns confirmation of deletion through HttpResponse
     */
    async deleteInvitation(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const deletedInvitation = await InvitationService.deleteInvitation(
                req.user!.userId,
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
     * Creates an RSVP response for an invitation
     * 
     * This endpoint allows a user to respond to an invitation they've received
     * by creating an RSVP with their attendance status.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information and RSVP data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.invitationId - ID of the invitation being responded to
     * @param {Object} req.body - RSVP details (status, message, etc.)
     * @returns {Promise<void>} - Returns the created RSVP through HttpResponse
     */
    async createRSVP(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            validateInput(createRSVPSchema, req.body);

            const rsvp = await InvitationService.createRSVP(
                req.user!.userId,
                req.params.invitationId,
                req.body,
            );
            HttpResponse.sendYES(res, 201, 'RSVP created successfully', { rsvp });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves all RSVPs created by the authenticated user with pagination
     * 
     * This endpoint fetches all RSVPs where the authenticated user is the creator,
     * supporting pagination and sorting options.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of RSVPs per page (default: 10)
     * @param {string} req.query.sortBy - Sorting direction (default: 'desc')
     * @returns {Promise<void>} - Returns paginated RSVPs through HttpResponse
     */
    async getRSVPs(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await InvitationService.getRSVPs(req.user!.userId, page, limit, sortBy);
            HttpResponse.sendYES(res, 200, 'RSVPs fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves a specific RSVP by its ID
     * 
     * This endpoint fetches a single RSVP based on the provided RSVP ID,
     * ensuring the authenticated user has permission to view it.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.id - ID of the RSVP to fetch
     * @returns {Promise<void>} - Returns the requested RSVP through HttpResponse
     */
    async getRSVPById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const rsvp = await InvitationService.getRSVPById(req.user!.userId, req.params.id);
            HttpResponse.sendYES(res, 200, 'RSVP found successfully', { rsvp });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Deletes an RSVP
     * 
     * This endpoint allows a user to delete an RSVP they've created,
     * effectively withdrawing their response to an invitation.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.id - ID of the RSVP to delete
     * @returns {Promise<void>} - Returns confirmation of deletion through HttpResponse
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
     * Retrieves all invitations for a specific event (organizer only)
     * 
     * This endpoint fetches all invitations associated with a specific event,
     * typically accessible only by the event organizer, with pagination and sorting.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.query.eventId - ID of the event to fetch invitations for
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of invitations per page (default: 10)
     * @param {string} req.query.sortBy - Sorting direction (default: 'desc')
     * @returns {Promise<void>} - Returns paginated invitations through HttpResponse
     */

    async getInvitationsByEventId(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
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
                req.user!.userId,
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
     * Retrieves an RSVP for a specific invitation
     * 
     * This endpoint fetches the RSVP associated with a specific invitation,
     * if one exists.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.invitationId - ID of the invitation to fetch the RSVP for
     * @returns {Promise<void>} - Returns the RSVP through HttpResponse
     */
    async getRSVPByInvitationId(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const rsvp = await InvitationService.getRSVPByInvitationId(
                req.user!.userId,
                req.params.invitationId,
            );
            HttpResponse.sendYES(res, 200, 'RSVP fetched successfully', { rsvp });
        } catch (err) {
            next(err);
        }
    }
}
