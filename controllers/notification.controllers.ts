import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { NotificationModel } from "../models/notification.models";
import { HttpError } from "../helpers/httpsError.helpers";
import { sendNotification } from "../websocket"; // Import WebSocket notification emitter

interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
    };
}

export class NotificationController {
    /**
     * Get all notifications for the authenticated user
     */
    async getNotifications(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log("Fetching all notifications");

            const userId = req.user?.userId;
            if (!userId) {
                return next(new HttpError("Unauthorized", 401, "AUTH_REQUIRED"));
            }

            const notifications = await NotificationModel.find({ recipient: userId })
                .sort({ createdAt: -1 }); // Most recent first

            res.status(200).json({
                success: true,
                message: "Notifications fetched successfully",
                data: notifications,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get a specific notification by ID
     */
    async getNotificationById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log("Fetching notification by ID");

            const { id } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return next(new HttpError("Unauthorized", 401, "AUTH_REQUIRED"));
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid notification ID format",
                });
                return;
            }

            const notification = await NotificationModel.findById(id);

            if (!notification) {
                res.status(404).json({
                    success: false,
                    message: "Notification not found",
                });
                return;
            }

            if (notification.recipient.toString() !== userId) {
                return next(new HttpError("Access denied", 403, "FORBIDDEN"));
            }

            res.status(200).json({
                success: true,
                message: "Notification fetched successfully",
                data: notification,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Create a new notification (Admin or System Use)
     */
    async createNotification(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log("Creating a new notification");

            const { recipient, type, message, relatedEvent, relatedUser } = req.body;

            if (!recipient || !type || !message) {
                res.status(400).json({
                    success: false,
                    message: "Recipient, type, and message are required",
                });
                return;
            }

            // Create the notification in the database
            const newNotification = await NotificationModel.create({
                recipient,
                type,
                message,
                relatedEvent,
                relatedUser,
                isRead: false,
            });

            // Emit the notification via WebSocket
            sendNotification(recipient, newNotification);

            res.status(201).json({
                success: true,
                message: "Notification created successfully",
                data: newNotification,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log("Marking notification as read");

            const { id } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return next(new HttpError("Unauthorized", 401, "AUTH_REQUIRED"));
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid notification ID format",
                });
                return;
            }

            const notification = await NotificationModel.findById(id);

            if (!notification) {
                res.status(404).json({
                    success: false,
                    message: "Notification not found",
                });
                return;
            }

            if (notification.recipient.toString() !== userId) {
                return next(new HttpError("Access denied", 403, "FORBIDDEN"));
            }

            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();

            res.status(200).json({
                success: true,
                message: "Notification marked as read",
                data: notification,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Delete a notification by ID
     */
    async deleteNotification(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log("Deleting notification");

            const { id } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return next(new HttpError("Unauthorized", 401, "AUTH_REQUIRED"));
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid notification ID format",
                });
                return;
            }

            const notification = await NotificationModel.findById(id);

            if (!notification) {
                res.status(404).json({
                    success: false,
                    message: "Notification not found",
                });
                return;
            }

            if (notification.recipient.toString() !== userId) {
                return next(new HttpError("Access denied", 403, "FORBIDDEN"));
            }

            await NotificationModel.findByIdAndDelete(id);

            res.status(200).json({
                success: true,
                message: "Notification deleted successfully",
            });
        } catch (err) {
            next(err);
        }
    }
}