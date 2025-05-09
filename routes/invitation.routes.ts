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

/**
 * POST /invitations
 * 
 * Creates a new invitation to an event
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates the invitation data against createInvitationSchema
 * @controller controller.createInvitation - Processes invitation creation
 * 
 * @body {Object} invitationData - Invitation details including eventId, recipientId, etc.
 * 
 * @returns {Object} The created invitation details
 */
invitationRoutes.post(
    '/invitations',
    authenticationToken,
    validateRequest(createInvitationSchema),
    controller.createInvitation,
);

/**
 * GET /received
 * 
 * Retrieves all invitations received by the current user
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.getAllReceivedInvitations - Fetches all invitations for the user
 * 
 * @returns {Array} List of invitations received by the user
 */
invitationRoutes.get('/received', authenticationToken, controller.getAllReceivedInvitations);

/**
 * GET /invitations/event
 * 
 * Retrieves all invitations for a specific event
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates the query parameters against getInvitationsByEventIdSchema
 * @controller controller.getInvitationsByEventId - Fetches invitations for the specified event
 * 
 * @query {string} eventId - ID of the event to get invitations for
 * 
 * @returns {Array} List of invitations for the specified event
 */
invitationRoutes.get(
    '/invitations/event',
    authenticationToken,
    validateRequest(getInvitationsByEventIdSchema, 'query'),
    controller.getInvitationsByEventId,
);

/**
 * GET /received/:eventId
 * 
 * Retrieves an invitation received by the current user for a specific event
 * 
 * @param {string} eventId - ID of the event
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.getReceivedInvitationByEventId - Fetches the specific invitation
 * 
 * @returns {Object} The invitation details if found
 */
invitationRoutes.get(
    '/received/:eventId',
    authenticationToken,
    controller.getReceivedInvitationByEventId,
);

/**
 * GET /rsvps
 * 
 * Retrieves all RSVPs created by the current user
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.getRSVPs - Fetches all RSVPs for the user
 * 
 * @returns {Array} List of RSVPs created by the user
 */
invitationRoutes.get('/rsvps', authenticationToken, controller.getRSVPs);

/**
 * GET /invitations/:id
 * 
 * Retrieves details of a specific invitation by ID
 * 
 * @param {string} id - ID of the invitation to retrieve
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.getInvitationById - Fetches the specific invitation
 * 
 * @returns {Object} The requested invitation details
 */
invitationRoutes.get('/invitations/:id', authenticationToken, controller.getInvitationById);

/**
 * DELETE /invitations/:id
 * 
 * Deletes a specific invitation
 * 
 * @param {string} id - ID of the invitation to delete
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.deleteInvitation - Handles invitation deletion
 * 
 * @returns {Object} Confirmation of deletion
 */
invitationRoutes.delete('/invitations/:id', authenticationToken, controller.deleteInvitation);

/**
 * POST /rsvp/:invitationId
 * 
 * Creates a new RSVP response to an invitation
 * 
 * @param {string} invitationId - ID of the invitation being responded to
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.createRSVP - Processes RSVP creation
 * 
 * @body {Object} rsvpData - RSVP details including response status
 * 
 * @returns {Object} The created RSVP details
 */
invitationRoutes.post('/rsvp/:invitationId', authenticationToken, controller.createRSVP);

/**
 * GET /rsvps/:id
 * 
 * Retrieves details of a specific RSVP by ID
 * 
 * @param {string} id - ID of the RSVP to retrieve
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.getRSVPById - Fetches the specific RSVP
 * 
 * @returns {Object} The requested RSVP details
 */
invitationRoutes.get('/rsvps/:id', authenticationToken, controller.getRSVPById);

/**
 * DELETE /rsvps/:id
 * 
 * Deletes a specific RSVP
 * 
 * @param {string} id - ID of the RSVP to delete
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.deleteRSVP - Handles RSVP deletion
 * 
 * @returns {Object} Confirmation of deletion
 */
invitationRoutes.delete('/rsvps/:id', authenticationToken, controller.deleteRSVP);

/**
 * GET /invitations/:invitationId/rsvp
 * 
 * Retrieves the RSVP associated with a specific invitation
 * 
 * @param {string} invitationId - ID of the invitation
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller controller.getRSVPByInvitationId - Fetches the RSVP for the specified invitation
 * 
 * @returns {Object} The RSVP details if found
 */
invitationRoutes.get(
    '/invitations/:invitationId/rsvp',
    authenticationToken,
    controller.getRSVPByInvitationId,
);

export default invitationRoutes;
