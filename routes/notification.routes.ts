import { Router } from "express";
import { NotificationController } from "../controllers/notification.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";

const notificationRoutes = Router();
const controller = new NotificationController();

// Get all notifications for the authenticated user (Normal User)
notificationRoutes.get("/", authenticationToken, controller.getNotifications);

// Get a specific notification by ID (Normal User)
notificationRoutes.get("/:id", authenticationToken, controller.getNotificationById);

// Create a new notification (Admin or System Use)
notificationRoutes.post("/", authenticationToken, controller.createNotification);

// Mark a notification as read (Normal User)
notificationRoutes.put("/:id/read", authenticationToken, controller.markAsRead);

// Delete a notification by ID (Normal User)
notificationRoutes.delete("/:id", authenticationToken, controller.deleteNotification);

export default notificationRoutes;