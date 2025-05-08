import { NotificationService } from '../services/notification.service';
import { NotificationModel, UserNotificationModel } from '../models/notification.models';
import { UserModel } from '../models/user.models';
import { HttpError } from '../helpers/httpsError.helpers';
import mongoose from 'mongoose';
import { NotificationType } from '../enums/notificationType.enums';

jest.mock('../models/notification.models');
jest.mock('../models/user.models');

describe('NotificationService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createNotification', () => {
        it('should successfully create a notification and user notifications', async () => {
            const mockNotificationData = {
                userIds: ['user1', 'user2'],
                type: NotificationType.INVITATION,
                content: 'You are invited!',
                title: 'Event Invitation',
            };

            const mockUsersDuplicate = [{ _id: 'user1' }, { _id: 'user2' }];
            const mockSavedNotification = { _id: 'notification1', ...mockNotificationData };

            (UserModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUsersDuplicate),
            });
            (NotificationModel.prototype.save as jest.Mock).mockResolvedValue(mockSavedNotification);
            (UserNotificationModel.insertMany as jest.Mock).mockResolvedValue([]);

            const result = await NotificationService.createNotification(mockNotificationData);

            expect(UserModel.find).toHaveBeenCalledWith({ _id: { $in: mockNotificationData.userIds } });
            expect(NotificationModel.prototype.save).toHaveBeenCalled();
            expect(UserNotificationModel.insertMany).toHaveBeenCalledWith([
                { userId: new mongoose.Types.ObjectId('user1'), notificationId: 'notification1' },
                { userId: new mongoose.Types.ObjectId('user2'), notificationId: 'notification1' },
            ]);
            expect(result).toEqual(mockSavedNotification);
        });

        it('should throw an error if some users are not found', async () => {
            const mockNotificationData = {
                userIds: ['user1', 'user2'],
                type: NotificationType.INVITATION,
                content: 'You are invited!',
                title: 'Event Invitation',
            };

            const mockUsers = [{ _id: 'user1' }];

            (UserModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUsers),
            });

            await expect(NotificationService.createNotification(mockNotificationData)).rejects.toThrow(
                new HttpError('Some users not found', 404, 'USER_NOT_FOUND'),
            );
        });

        it('should throw an error if notification creation fails', async () => {
            const mockNotificationData = {
                userIds: ['user1', 'user2'],
                type: NotificationType.INVITATION,
                content: 'You are invited!',
                title: 'Event Invitation',
            };

            const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];

            (UserModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUsers),
            });
            (NotificationModel.prototype.save as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(NotificationService.createNotification(mockNotificationData)).rejects.toThrow(
                new HttpError('Failed to create notification', 500, 'CREATE_NOTIFICATION_FAILED'),
            );
        });
    });

    describe('deleteNotification', () => {
        it('should mark a notification as deleted', async () => {
            const mockNotificationId = 'notification1';
            const mockDeletedNotification = { _id: mockNotificationId, isDelete: true };

            (NotificationModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockDeletedNotification);

            const result = await NotificationService.deleteNotification(mockNotificationId);

            expect(NotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
                mockNotificationId,
                { isDelete: true },
                { new: true },
            );
            expect(result).toEqual(mockDeletedNotification);
        });

        it('should throw an error if notification is not found', async () => {
            const mockNotificationId = 'notification1';

            (NotificationModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(NotificationService.deleteNotification(mockNotificationId)).rejects.toThrow(
                new HttpError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND'),
            );
        });

        it('should throw an error if deletion fails', async () => {
            const mockNotificationId = 'notification1';

            (NotificationModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(NotificationService.deleteNotification(mockNotificationId)).rejects.toThrow(
                new HttpError('Failed to delete notification', 500, 'DELETE_NOTIFICATION_FAILED'),
            );
        });
    });

    describe('getUserNotifications', () => {
        it('should return user notifications', async () => {
            const mockUserId = 'user1';
            const mockUserNotifications = [
                { notificationId: { _id: 'notification1', isDelete: false } },
                { notificationId: { _id: 'notification2', isDelete: false } },
            ];

            (UserNotificationModel.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockUserNotifications),
                }),
            });

            const result = await NotificationService.getUserNotifications(mockUserId);

            expect(UserNotificationModel.find).toHaveBeenCalledWith({ userId: mockUserId });
            expect(result).toEqual([
                { _id: 'notification1', isDelete: false },
                { _id: 'notification2', isDelete: false },
            ]);
        });

        it('should throw an error if fetching user notifications fails', async () => {
            const mockUserId = 'user1';

            (UserNotificationModel.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockRejectedValue(new Error('Database error')),
                }),
            });

            await expect(NotificationService.getUserNotifications(mockUserId)).rejects.toThrow(
                new HttpError('Failed to get user notifications', 500, 'GET_USER_NOTIFICATIONS_FAILED'),
            );
        });
    });
});