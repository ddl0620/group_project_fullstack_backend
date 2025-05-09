import { Router } from 'express';
import { EventController } from '../controllers/event.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { joinEventSchema, respondEventSchema } from '../validation/event.validation';
import upload from '../uploads/multer.config';

/**
 * Event Router
 * 
 * This router handles operations related to events, including creation, retrieval,
 * joining, responding to join requests, updating, and deletion.
 * All routes require authentication to ensure only logged-in users can interact with events.
 */
const eventRoutes = Router();
const event = new EventController();

/**
 * POST /add-event
 * 
 * Creates a new event
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware upload.array - Handles multiple image uploads (up to 10)
 * @controller event.addEvent - Processes event creation
 * 
 * @body {Object} eventData - Event details including title, description, date, etc.
 * @body {Array<File>} images - Optional image files for the event (up to 10)
 * 
 * @returns {Object} The created event details
 */
eventRoutes.post('/add-event', authenticationToken, upload.array('images', 10), event.addEvent);

/**
 * GET /all-event
 * 
 * Retrieves all available events
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller event.getAllEvent - Fetches all events
 * 
 * @returns {Array} List of all events
 */
eventRoutes.get('/all-event', authenticationToken, event.getAllEvent);

/**
 * GET /joined
 * 
 * Retrieves all events that the current user has joined
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller event.getJoinedEvent - Fetches events joined by the user
 * 
 * @returns {Array} List of events the user has joined
 */
eventRoutes.get('/joined', authenticationToken, event.getJoinedEvent);

/**
 * GET /my
 * 
 * Retrieves all events created by the current user
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller event.getMyEvent - Fetches events created by the user
 * 
 * @returns {Array} List of events created by the user
 */
eventRoutes.get('/my', authenticationToken, event.getMyEvent);

/**
 * POST /:eventId/join
 * 
 * Submits a request to join a specific event
 * 
 * @param {string} eventId - ID of the event to join
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates the join request against joinEventSchema
 * @controller event.joinEvent - Processes the join request
 * 
 * @body {Object} joinData - Data required for joining the event (validated by joinEventSchema)
 * 
 * @returns {Object} Confirmation of the join request
 */
eventRoutes.post(
    '/:eventId/join',
    authenticationToken,
    validateRequest(joinEventSchema),
    event.joinEvent,
);

/**
 * POST /:eventId/respond-join
 * 
 * Responds to a join request for an event (approve/reject)
 * 
 * @param {string} eventId - ID of the event with the join request
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates the response against respondEventSchema
 * @controller event.respondEvent - Processes the response to the join request
 * 
 * @body {Object} responseData - Response details (e.g., approve/reject, userId)
 *                              (validated by respondEventSchema)
 * 
 * @returns {Object} Confirmation of the response action
 */
eventRoutes.post(
    '/:eventId/respond-join',
    authenticationToken,
    validateRequest(respondEventSchema),
    event.respondEvent,
);

/**
 * GET /:id
 * 
 * Retrieves details of a specific event by ID
 * 
 * @param {string} id - ID of the event to retrieve
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller event.getEventById - Fetches the specific event
 * 
 * @returns {Object} The requested event details
 */
eventRoutes.get('/:id', authenticationToken, event.getEventById);

/**
 * PUT /:id
 * 
 * Updates an existing event
 * 
 * @param {string} id - ID of the event to update
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware upload.array - Handles multiple image uploads (up to 10)
 * @controller event.updateEvent - Processes the event update
 * 
 * @body {Object} updatedData - Updated event details
 * @body {Array<File>} images - Optional updated image files for the event
 * 
 * @returns {Object} The updated event details
 */
eventRoutes.put('/:id', authenticationToken, upload.array('images', 10), event.updateEvent);

/**
 * DELETE /:id
 * 
 * Removes an event
 * 
 * @param {string} id - ID of the event to delete
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller event.deleteEvent - Handles event deletion
 * 
 * @returns {Object} Confirmation of deletion
 */
eventRoutes.delete('/:id', authenticationToken, event.deleteEvent);

export default eventRoutes;
