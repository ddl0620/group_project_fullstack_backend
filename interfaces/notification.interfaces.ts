import mongoose, {Document} from "mongoose";
import {NotificationType} from "../enums/notificationType.enums";

export interface NotificationInterface extends Document {
    title: string;
    content: string;
    type: NotificationType;
    createdAt: Date;
    isRead: boolean;
    isDelete: boolean;
}

export interface UserNotificationInterface extends Document {
    userId: mongoose.Types.ObjectId;
    notificationId: mongoose.Types.ObjectId;
    createdAt: Date;
}