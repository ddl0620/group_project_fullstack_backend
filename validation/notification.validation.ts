import Joi from 'joi';
import { NotificationType } from '../enums/notificationType.enums';

export const createNotificationSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.base': 'Title must be a string',
        'any.required': 'Title is required',
    }),
    content: Joi.string().required().messages({
        'string.base': 'Content must be a string',
        'any.required': 'Content is required',
    }),
    type: Joi.string()
        .valid(...Object.values(NotificationType))
        .required()
        .messages({
            'string.base': 'Type must be a string',
            'any.only': `Type must be one of ${Object.values(NotificationType).join(', ')}`,
            'any.required': 'Type is required',
        }),
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
    isDelete: Joi.boolean().optional().messages({
        'boolean.base': 'isDelete must be a boolean',
    }),
});