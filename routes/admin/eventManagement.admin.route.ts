import { Router } from 'express';
import { adminOnlyMiddleware, authenticationToken } from '../../middlewares/auth.middleware';
import { EventManagementController } from '../../controllers/admin/eventManagement.controller';
import upload from '../../uploads/multer.config';

/**
 * Admin Event Management Router
 * 
 * This router handles all administrative operations related to event management,
 * including listing, creating, updating, and managing event statuses.
 * All routes are protected by authentication and admin-only access controls.
 */
const AdminEventRouter = Router();

/**
 * GET /event-management/
 * 
 * Retrieves all events in the system for administrative review
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @controller EventManagementController.getAllEvents - Lists all events with filtering options
 * 
 * @returns {Array} List of events with pagination support
 */
AdminEventRouter.get(
    '/',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.getAllEvents,
);

/**
 * POST /event-management/:userId
 * 
 * Creates a new event on behalf of a specific user
 * 
 * @param {string} userId - ID of the user for whom the event is being created
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @middleware upload.array - Handles multiple image uploads (up to 10)
 * @controller EventManagementController.createNewEvent - Creates the event with provided data
 * 
 * @returns {Object} The created event details
 */
AdminEventRouter.post(
    '/:userId',
    authenticationToken,
    adminOnlyMiddleware,
    upload.array('images', 10),
    EventManagementController.createNewEvent,
);

/**
 * PUT /event-management/:eventId
 * 
 * Updates an existing event's details
 * 
 * @param {string} eventId - ID of the event to update
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @middleware upload.array - Handles multiple image uploads (up to 10)
 * @controller EventManagementController.updateEvent - Updates the event with provided data
 * 
 * @returns {Object} The updated event details
 */
AdminEventRouter.put(
    '/:eventId',
    authenticationToken,
    adminOnlyMiddleware,
    upload.array('images', 10),
    EventManagementController.updateEvent,
);

/**
 * PUT /event-management/active/:eventId
 * 
 * Toggles or sets the active status of an event
 * 
 * @param {string} eventId - ID of the event to update status
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @controller EventManagementController.updateActiveStatus - Updates the event's active status
 * 
 * @returns {Object} Updated status confirmation
 */
AdminEventRouter.put(
    '/active/:eventId',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.updateActiveStatus,
);

/**
 * GET /event-management/:id
 * 
 * Retrieves all events created by a specific user
 * 
 * @param {string} id - User ID whose events should be retrieved
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @controller EventManagementController.getAllEventByUserId - Gets events filtered by user ID
 * 
 * @returns {Array} List of events created by the specified user
 */
AdminEventRouter.get(
    '/:id',
    authenticationToken,
    adminOnlyMiddleware,
    EventManagementController.getAllEventByUserId,
);

export default AdminEventRouter;
