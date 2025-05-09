import Joi from 'joi';
import { NotificationType } from '../enums/notificationType.enums';

/**
 * Validation Schema for Notification Creation
 * 
 * Defines validation rules for creating new notifications in the system.
 * Ensures that notifications have required fields like title, content, type,
 * and recipient user IDs. Supports optional deletion flag for soft-delete functionality.
 */
export const createNotificationSchema = Joi.object({
    /**
     * Notification title
     * 
     * Required string that serves as the primary headline for the notification.
     * Displayed prominently in notification listings and alerts.
     * Should be concise but descriptive of the notification's purpose.
     */
    title: Joi.string().required().messages({
        'string.base': 'Title must be a string',
        'any.required': 'Title is required',
    }),
    /**
     * Notification content
     * 
     * Required string that provides the detailed message of the notification.
     * Contains the main information that needs to be communicated to the user.
     * May include formatting, links, or other rich text elements depending on the notification system.
     */
    content: Joi.string().required().messages({
        'string.base': 'Content must be a string',
        'any.required': 'Content is required',
    }),
    /**
     * Notification type
     * 
     * Required string that categorizes the notification.
     * Must be one of the predefined notification types from the NotificationType enum.
     * Used for filtering, display customization, and notification handling logic.
     * Affects how the notification is presented and what actions are available.
     */
    type: Joi.string()
        .valid(...Object.values(NotificationType))
        .required()
        .messages({
            'string.base': 'Type must be a string',
            'any.only': `Type must be one of ${Object.values(NotificationType).join(', ')}`,
            'any.required': 'Type is required',
        }),
        /**
     * Recipient user IDs
     * 
     * Required array of strings that identify which users should receive the notification.
     * Each ID must be a valid MongoDB ObjectId (24 character hex string).
     * At least one recipient is required.
     * Supports sending the same notification to multiple users simultaneously.
     */
    userIds: Joi.array()
        .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId'))
        .min(1)
        .required()
        .messages({
            'array.base': 'User IDs must be an array',
            'string.pattern.name': 'Each user ID must be a valid ObjectId',
            'array.min': 'At least one user ID is required',
            'any.required': 'User IDs are required',
        }),
        /**
     * Deletion flag
     * 
     * Optional boolean that indicates whether the notification should be marked for deletion.
     * When true, the notification may be soft-deleted rather than immediately removed from the database.
     * Useful for implementing trash/archive functionality or delayed cleanup processes.
     */
    isDelete: Joi.boolean().optional().messages({
        'boolean.base': 'isDelete must be a boolean',
    }),
});