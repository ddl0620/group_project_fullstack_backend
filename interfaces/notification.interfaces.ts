import mongoose, { Document } from "mongoose";
import { NOTIFICATION_TYPE } from "../enums/source.enum";

export interface NotificationInterfaces extends Document {
    type: NOTIFICATION_TYPE; // Assuming EventType is an enum
    title: string;
    description: string;
    senderId: mongoose.Schema.Types.ObjectId | string; // This is likely an ObjectId referencing the User model
    receiverId: mongoose.Schema.Types.ObjectId | string; // This is likely an ObjectId referencing the User model
    isRead: boolean;
    createdAt?: Date; // Optional because Mongoose will automatically handle this
}
