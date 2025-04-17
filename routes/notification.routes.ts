import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controllers';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
    createNotificationSchema,
} from "../validation/notification.validation";


const notificationRoutes = Router();
const notification = new NotificationController();

notificationRoutes.post('/create-notification', authenticationToken, validateRequest(createNotificationSchema), notification.createNotification);
notificationRoutes.delete('/delete-notification/:id', authenticationToken, notification.deleteNotification);
notificationRoutes.get('/get-notifications', authenticationToken, notification.getUserNotifications);

export default notificationRoutes;