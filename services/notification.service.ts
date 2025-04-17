import mongoose from 'mongoose';
import { NotificationInterface } from '../interfaces/notification.interfaces';
import { NotificationModel, UserNotificationModel } from '../models/notification.models';
import { HttpError } from "../helpers/httpsError.helpers";
import { CreateNotificationInput} from "../types/notification.type";
import {UserModel} from "../models/user.models";

export class NotificationService {
    static async createNotification(notificationData: CreateNotificationInput): Promise<NotificationInterface> {
        const users = await UserModel.find({ _id: { $in: notificationData.userIds } }).select('_id');

        if (users.length !== notificationData.userIds.length) {
            throw new HttpError('Some users not found', 404, 'USER_NOT_FOUND');
        }

        try {
            const notification = new NotificationModel({
                type: notificationData.type,
                content: notificationData.content,
                title: notificationData.title,
            });

            const savedNotification = await notification.save();

            const userNotifications = notificationData.userIds.map((userId) => ({
                userId: new mongoose.Types.ObjectId(userId),
                notificationId: savedNotification._id,
            }));
            await UserNotificationModel.insertMany(userNotifications);
            return savedNotification;
        }
        catch (err) {
            throw new HttpError('Failed to create notification', 500, 'CREATE_NOTIFICATION_FAILED');
        }
    }

    static async deleteNotification(notificationId: string)
    : Promise<NotificationInterface | null> {
        try {
            const deletedNotification = await NotificationModel.findByIdAndUpdate(
                notificationId,
                { isDelete: true },
                { new: true }
            )
            if (!deletedNotification) {
                throw new HttpError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
            }
            return deletedNotification;
        } catch (error) {
            throw new HttpError('Failed to delete notification', 500, 'DELETE_NOTIFICATION_FAILED');
        }
    }

    static async getUserNotifications(userId: string): Promise<NotificationInterface[] | null> {
        try {
            const userNotifications = await UserNotificationModel.find({ userId })
                .populate({
                    path: 'notificationId',
                    match: { isDelete: false },
                })
                .exec();

            // Filter out null notificationId and map to notificationId
            const notifications = userNotifications
                .filter((userNotification) => userNotification.notificationId) // Ensure notificationId exists
                .map((userNotification) => userNotification.notificationId as unknown as NotificationInterface);

            return notifications.length > 0 ? notifications : null;
        } catch (error) {
            console.error('Error in getUserNotifications:', error); // Log the original error
            throw new HttpError('Failed to get user notifications', 500, 'GET_USER_NOTIFICATIONS_FAILED');
        }
    }
}