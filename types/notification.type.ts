import {NotificationType} from "../enums/notificationType.enums";

/**
 * Create Notification Input Type
 * 
 * Represents the data required to create new notifications for users.
 * This type defines the structure for generating and sending notifications
 * to one or multiple recipients in the system.
 */
export type CreateNotificationInput = {
    title: string;
    content: string;
    type: NotificationType;
    userIds: string[];
}