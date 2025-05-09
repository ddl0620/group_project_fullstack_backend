import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createNotificationSchema } from '../validation/notification.validation';

const notificationRoutes = Router();
const notification = new NotificationController();

/**
 * POST /
 * 
 * Creates a new notification
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates the notification data against createNotificationSchema
 * @controller notification.createNotification - Processes notification creation
 * 
 * @body {Object} notificationData - Notification details such as recipient, type, content, etc.
 * 
 * @returns {Object} The created notification details
 */
notificationRoutes.post(
    '/',
    authenticationToken,
    validateRequest(createNotificationSchema),
    notification.createNotification,
);

/**
 * DELETE /:id
 * 
 * Deletes a specific notification
 * 
 * @param {string} id - ID of the notification to delete
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller notification.deleteNotification - Handles notification deletion
 * 
 * @returns {Object} Confirmation of deletion
 */
notificationRoutes.delete('/:id', authenticationToken, notification.deleteNotification);

/**
 * GET /
 * 
 * Retrieves all notifications for the current user
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @controller notification.getUserNotifications - Fetches notifications for the authenticated user
 * 
 * @returns {Array} List of notifications for the user
 */
notificationRoutes.get('/', authenticationToken, notification.getUserNotifications);

export default notificationRoutes;
