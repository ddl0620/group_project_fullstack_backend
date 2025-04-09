import mongoose, { Schema } from "mongoose";
import { NotificationInterface } from "../interfaces/notification.interfaces";
import { NotificationType } from "../enums/notificationType.enums";

const NotificationSchema = new Schema<NotificationInterface>(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User model
        type: { type: String, enum: Object.values(NotificationType), required: true }, // Enum for notification type
        message: { type: String, required: true, maxlength: 500, minlength: 1 }, // Notification message
        relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Reference to an involved Event
        relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to another involved User
        isRead: { type: Boolean, default: false }, // Whether the notification has been read
        readAt: { type: Date }, // Timestamp for when the notification was marked as read
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
);

// Add indexes for better query performance
NotificationSchema.index({ recipient: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ isRead: 1 });

export const NotificationModel = mongoose.model<NotificationInterface>("Notification", NotificationSchema);