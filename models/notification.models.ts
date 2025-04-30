import mongoose, { model, Schema } from 'mongoose';
import { NotificationType } from '../enums/notificationType.enums';
import { NotificationInterface, UserNotificationInterface } from '../interfaces/notification.interfaces';

const NotificationSchema = new Schema<NotificationInterface>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
});

const UserNotificationSchema = new Schema<UserNotificationInterface>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
    createdAt: { type: Date, default: Date.now },
});

export const NotificationModel = model<NotificationInterface>('Notification', NotificationSchema);
export const UserNotificationModel = model<UserNotificationInterface>('UserNotification', UserNotificationSchema);