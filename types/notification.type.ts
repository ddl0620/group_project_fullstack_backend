import {NotificationType} from "../enums/notificationType.enums";

export type CreateNotificationInput = {
    title: string;
    content: string;
    type: NotificationType;
    userIds: string[];
}