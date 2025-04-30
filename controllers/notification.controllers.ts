import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { NotificationService } from "../services/notification.service";
import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";

export class NotificationController {
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

    async markNotificationAsRead(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        try {
            const notificationId = req.params.id;
            const updatedNotification = await NotificationService.markNotificationAsRead(notificationId);
            HttpResponse.sendYES(res, 200, 'Notification marked as read successfully', { notification: updatedNotification });
        }
        catch (error) {
            next(error);
        }
    }
}

