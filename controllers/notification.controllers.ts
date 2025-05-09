import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { NotificationService } from "../services/notification.service";
import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";

/**
 * NotificationController
 * 
 * This controller handles all operations related to notifications, including:
 * - Creating new notifications
 * - Deleting existing notifications
 * - Retrieving notifications for a specific user
 * 
 * All endpoints require authentication through AuthenticationRequest except
 * where notifications are created by the system.
 */
export class NotificationController {
    /**
     * Creates a new notification
     * 
     * This endpoint allows for the creation of a new notification in the system.
     * The notification can be targeted to one or multiple users.
     * 
     * @param req - AuthenticationRequest object containing notification data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {Object} req.body - Notification details (title, message, userIds, etc.)
     * @returns {Promise<void>} - Returns the created notification through HttpResponse
     */
    async createNotification(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const newNotification = await NotificationService.createNotification(req.body);
            HttpResponse.sendYES(res, 201, 'Notification created successfully', { notification: newNotification });
        }
        catch (error) {
            next(error);
        }
    }

    /**
     * Deletes a notification by ID
     * 
     * This endpoint allows for the deletion of an existing notification
     * identified by its unique ID.
     * 
     * @param req - AuthenticationRequest object containing notification ID
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.id - ID of the notification to delete
     * @returns {Promise<void>} - Returns the deleted notification through HttpResponse
     */
    async deleteNotification(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        try {
            const deletedNotification = await NotificationService.deleteNotification(req.params.id);
            HttpResponse.sendYES(res, 201, 'Notification deleted successfully', { notification: deletedNotification });
        }
        catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves all notifications for the authenticated user
     * 
     * This endpoint fetches all notifications where the authenticated user
     * is a recipient.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.user.userId - ID of the authenticated user
     * @returns {Promise<void>} - Returns the user's notifications through HttpResponse
     */
    async getUserNotifications(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        try {
            const userId = req.user?.userId as string;
            const notifications = await NotificationService.getUserNotifications(userId);
            HttpResponse.sendYES(res, 200, 'User notifications fetched successfully', { notifications });
        }
        catch (error) {
            next(error);
        }
    }
}

