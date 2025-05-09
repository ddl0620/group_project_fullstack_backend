import mongoose, { model, Schema } from 'mongoose';
import { NotificationType } from '../enums/notificationType.enums';
import { NotificationInterface, UserNotificationInterface } from '../interfaces/notification.interfaces';

/**
 * Mongoose schema for notifications.
 * 
 * This schema defines the structure for notification templates/content in MongoDB,
 * representing system notifications that can be sent to users. It stores the core
 * notification content independent of which users receive it.
 */
const NotificationSchema = new Schema<NotificationInterface>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    createdAt: { type: Date, default: Date.now },
    isDelete: { type: Boolean, default: false },
});

/**
 * Mongoose schema for user-notification relationships.
 * 
 * This schema defines the many-to-many relationship between users and notifications,
 * tracking which users should receive which notifications. It allows the system to
 * deliver the same notification to multiple users without duplicating content.
 */
const UserNotificationSchema = new Schema<UserNotificationInterface>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
    createdAt: { type: Date, default: Date.now },
});


/**
 * Mongoose model for notification content documents.
 * 
 * This model provides an interface for creating, querying, updating, and
 * deleting notification templates in the MongoDB 'Notification' collection.
 */
export const NotificationModel = model<NotificationInterface>('Notification', NotificationSchema);

/**
 * Mongoose model for user-notification relationship documents.
 * 
 * This model provides an interface for creating, querying, updating, and
 * deleting user-notification relationships in the MongoDB 'UserNotification' collection.
 * It enables tracking which users should receive which notifications.
 */
export const UserNotificationModel = model<UserNotificationInterface>('UserNotification', UserNotificationSchema);