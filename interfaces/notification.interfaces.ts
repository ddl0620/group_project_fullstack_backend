import mongoose, {Document} from "mongoose";
import {NotificationType} from "../enums/notificationType.enums";

/**
 * Interface for notifications in the system
 * 
 * Represents a notification template that can be sent to users.
 * This interface extends Mongoose's Document type to enable direct use with Mongoose models
 * while providing type safety for notification-related operations.
 */
export interface NotificationInterface extends Document {
    title: string;
    content: string;
    type: NotificationType;
    createdAt: Date;
    isDelete: boolean;
}

/**
 * Interface for user-specific notification instances
 * 
 * Represents the relationship between a user and a notification.
 * This junction entity enables tracking which notifications have been sent to which users,
 * allowing for user-specific notification management (e.g., read status, dismissal).
 */
export interface UserNotificationInterface extends Document {
    userId: mongoose.Types.ObjectId;
    notificationId: mongoose.Types.ObjectId;
    createdAt: Date;
}