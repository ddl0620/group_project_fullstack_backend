import mongoose from 'mongoose';
import { NotificationInterface } from '../interfaces/notification.interfaces';
import { NotificationModel, UserNotificationModel } from '../models/notification.models';
import { HttpError } from '../helpers/httpsError.helpers';
import { CreateNotificationInput } from '../types/notification.type';
import { UserModel } from '../models/user.models';
import { NotificationType } from '../enums/notificationType.enums';
import { UserInterface } from '../interfaces/user.interfaces';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';

/**
 * Notification Service
 * 
 * This service manages the creation, delivery, and management of notifications
 * across the application. It provides a centralized system for sending various
 * types of notifications to users and retrieving user-specific notifications.
 * The service includes pre-defined templates for common notification scenarios.
 */
export class NotificationService {
    /**
     * Creates a new notification and delivers it to specified users
     * 
     * Creates a notification record and associates it with multiple users
     * through the UserNotification junction table.
     * 
     * @param {CreateNotificationInput} notificationData - Notification content and recipient user IDs
     * @returns {Promise<NotificationInterface>} The created notification
     * @throws {HttpError} If users not found or creation fails
     */
    static async createNotification(
        notificationData: CreateNotificationInput,
    ): Promise<NotificationInterface> {
        const users: UserInterface[] | null = await UserModel.find({
            _id: { $in: notificationData.userIds },
        }).select('_id');

        if (users.length !== notificationData.userIds.length) {
            throw new HttpError(
                'Some users not found',
                StatusCode.NOT_FOUND,
                ErrorCode.USER_NOT_FOUND,
            );
        }

        try {
            const notification = new NotificationModel({
                type: notificationData.type,
                content: notificationData.content,
                title: notificationData.title,
            });

            const savedNotification: NotificationInterface = await notification.save();

            const userNotifications = notificationData.userIds.map(userId => ({
                userId: new mongoose.Types.ObjectId(userId),
                notificationId: savedNotification._id,
            }));
            await UserNotificationModel.insertMany(userNotifications);
            return savedNotification;
        } catch (err) {
            throw new HttpError(
                'Failed to create notification',
                StatusCode.BAD_REQUEST,
                ErrorCode.CAN_NOT_CREATE,
            );
        }
    }

    /**
     * Soft deletes a notification by ID
     * 
     * Marks a notification as deleted without removing it from the database.
     * 
     * @param {string} notificationId - ID of the notification to delete
     * @returns {Promise<NotificationInterface | null>} The deleted notification
     * @throws {HttpError} If notification not found or deletion fails
     */
    static async deleteNotification(notificationId: string): Promise<NotificationInterface | null> {
        try {
            const deletedNotification = await NotificationModel.findByIdAndUpdate(
                notificationId,
                { isDelete: true },
                { new: true },
            );
            if (!deletedNotification) {
                throw new HttpError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
            }
            return deletedNotification;
        } catch (err) {
            throw new HttpError('Failed to delete notification', 500, 'DELETE_NOTIFICATION_FAILED');
        }
    }

    /**
     * Retrieves all active notifications for a user
     * 
     * Gets all non-deleted notifications associated with the specified user.
     * 
     * @param {string} userId - ID of the user
     * @returns {Promise<NotificationInterface[] | null>} Array of notifications for the user
     * @throws {HttpError} If retrieval fails
     */
    static async getUserNotifications(userId: string): Promise<NotificationInterface[] | null> {
        try {
            const userNotifications = await UserNotificationModel.find({ userId })
                .populate({
                    path: 'notificationId',
                    match: { isDelete: false },
                })
                .exec();

            // Filter out null notificationId and map to notificationId
            return userNotifications
                .filter(userNotification => userNotification.notificationId) // Ensure notificationId exists
                .map(
                    userNotification =>
                        userNotification.notificationId as unknown as NotificationInterface,
                );
        } catch (error) {
            console.error('Error in getUserNotifications:', error); // Log the original error
            throw new HttpError(
                'Failed to get user notifications',
                500,
                'GET_USER_NOTIFICATIONS_FAILED',
            );
        }
    }

    /**
     * Creates notification content for event updates
     * 
     * @param {string} eventTitle - Title of the updated event
     * @returns {Object} Notification content with type, title and message
     */
    static eventUpdateNotificationContent = (eventTitle: string) => {
        return {
            type: NotificationType.UPDATE_EVENT,
            title: 'Event Details Updated!',
            content: `Dear participants, we would like to inform you that the event "${eventTitle}" you registered for, has been updated by the organizer.Please check the event details for the latest information.If you have any questions, feel free to contact the event organizer.`,
        };
    };

    /**
     * Creates notification content for event invitations
     * 
     * @param {string} eventTitle - Title of the event
     * @returns {Object} Notification content with type, title and message
     */
    static invitationNotificationContent = (eventTitle: string) => {
        return {
            type: NotificationType.INVITATION,
            title: 'You’re Invited!',
            content: `You have been invited to the event "${eventTitle}".Join us for an exciting experience! Please check the event details and RSVP at your earliest convenience.`,
        };
    };  

    /**
     * Creates notification content for comment replies
     * 
     * @param {string} eventTitle - Title of the event
     * @param {string} commenter - Name of the person who replied
     * @param {string} userName - Name of the recipient
     * @returns {Object} Notification content with type, title and message
     */
    static replyNotificationContent = (eventTitle: string, commenter: string, userName: string) => {
        return {
            type: NotificationType.REPLY,
            title: `${commenter} replied to your comment`,
            content: `Dear ${userName}, you have received a reply regarding the event "${eventTitle}" from ${commenter}.Please review the response and follow up if needed.`,
        };
    };

    /**
     * Creates notification content for new comments
     * 
     * @param {string} eventTitle - Title of the event
     * @param {string} commenter - Name of the person who commented
     * @param {string} userName - Name of the recipient
     * @returns {Object} Notification content with type, title and message
     */
    static commentNotificationContent = (
        eventTitle: string,
        commenter: string,
        userName: string,
    ) => {
        return {
            type: NotificationType.COMMENT,
            title: `${commenter} has commented on your post`,
            content: `Dear ${userName}, you have received a comment regarding the event "${eventTitle}" from ${commenter}.`,
        };
    };

    /**
     * Creates notification content for new posts
     * 
     * @param {string} eventTitle - Title of the event
     * @returns {Object} Notification content with type, title and message
     */
    static newPostNotificationContent = (eventTitle: string) => {
        return {
            type: NotificationType.NEW_POST,
            title: 'New Post Available!',
            content: `A new post has been added to the event "${eventTitle}". Visit the event page to stay updated with the latest content.`,
        };
    };

     /**
     * Creates notification content for event cancellations
     * 
     * @param {string} eventTitle - Title of the cancelled event
     * @returns {Object} Notification content with type, title and message
     */
    static deleteEventNotificationContent = (eventTitle: string) => {
        return {
            type: NotificationType.DELETE_EVENT,
            title: 'Event Cancelled!',
            content: `We regret to inform you that the event "${eventTitle}" has been cancelled. Please contact the organizer for more details or if you have any questions.`,
        };
    };

    /**
     * Creates notification content for accepted RSVPs
     * 
     * @param {string} eventName - Name of the event
     * @returns {Object} Notification content with type, title and message
     */
    static rsvpAcceptNotificationContent = (eventName: string) => {
        return {
            type: NotificationType.RSVP_ACCEPT,
            title: 'RSVP Confirmed!',
            content: `Your RSVP for the event "${eventName}" has been successfully accepted. 
            We look forward to seeing you there!`,
        };
    };

    /**
     * Creates notification content for declined RSVPs
     * 
     * @param {string} eventName - Name of the event
     * @returns {Object} Notification content with type, title and message
     */
    static rsvpDeniedNotificationContent = (eventName: string) => {
        return {
            type: NotificationType.RSVP_DENIED,
            title: 'RSVP Declined',
            content: `We regret to inform you that your RSVP for the event "${eventName}" 
            could not be accepted. Please contact the organizer for more details.`,
        };
    };

    /**
     * Creates notification content for join requests
     * 
     * @param {string} participantsSentName - Name of the user requesting to join
     * @param {string} eventName - Name of the event
     * @returns {Object} Notification content with type, title and message
     */
    static requestJoinNotificationContent = (participantsSentName: string, eventName: string) => {
        return {
            type: NotificationType.REQUEST_JOIN,
            title: 'New Join Request',
            content: `${participantsSentName} has requested to join the event "${eventName}". 
            Please review their request and respond accordingly.`,
        };
    };

    /**
     * Creates notification content for accepted join requests
     * 
     * @param {string} eventName - Name of the event
     * @returns {Object} Notification content with type, title and message
     */
    static requestAcceptNotificationContent = (eventName: string) => {
        return {
            type: NotificationType.REQUEST_ACCEPT,
            title: 'Join Request Approved!',
            content: `Your request to join the event "${eventName}" has been approved. 
            Welcome aboard! Check the event details for more information.`,
        };
    };

    /**
     * Creates notification content for declined join requests
     * 
     * @param {string} eventName - Name of the event
     * @returns {Object} Notification content with type, title and message
     */
    static requestDeniedNotificationContent = (eventName: string) => {
        return {
            type: NotificationType.REQUEST_DENIED,
            title: 'Join Request Declined',
            content: `We’re sorry, but your request to join the event "${eventName}" 
            has been declined. Please contact the organizer for further details.`,
        };
    };
}
