import mongoose, { Document } from "mongoose";
import { NotificationType } from "../enums/notificationType.enums";
import { UserInterface } from "./user.interfaces";
import { EventInterface } from "./event.interfaces";

export interface NotificationInterface extends Document {
    recipient: mongoose.Schema.Types.ObjectId | UserInterface; // User receiving the notification

    type: NotificationType; // Type of notification (enum)
    
    message: string; // Notification message

    relatedEvent?: mongoose.Schema.Types.ObjectId | EventInterface; // Event Invitation, event reminder, event cancellation
    
    relatedUser?: mongoose.Schema.Types.ObjectId | UserInterface; // Friend request, friend request accepted, friend request rejected, message received
    // Evenvitation sent by a user to another user used both
    isRead: boolean; // Whether the notification has been read
    
    createdAt: Date; // Timestamp when the notification was created
    
    updatedAt?: Date; // Timestamp when the notification was last updated
}