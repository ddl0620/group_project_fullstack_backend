import Joi from 'joi';
import { ParticipationStatus } from '../enums/participationStatus.enums';
import { EventType } from '../enums/eventType.enums';
import { NOTIFY_WHEN } from '../enums/notifyWhen.enums';

/**
 * Validation Schema for Event Creation
 *
 * Defines validation rules for creating new events in the system.
 * Ensures that events have required fields like title, description, type, dates,
 * and visibility settings. Used by regular users to create events.
 */
export const createEventSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.base': 'Title must be a string',
        'any.required': 'Title is required',
    }),
    description: Joi.string().required().messages({
        'string.base': 'Description must be a string',
        'any.required': 'Description is required',
    }),
    type: Joi.string()
        .valid(...Object.values(EventType))
        .required()
        .messages({
            'string.base': 'Type must be a string',
            'any.only': `Type must be one of ${Object.values(EventType).join(', ')}`,
            'any.required': 'Type is required',
        }),
    startDate: Joi.date().iso().required().messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date',
        'any.required': 'End date is required',
    }),
    startTime: Joi.string()
        .default('00:00')
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.base': 'Start time must be a string',
            'string.pattern.name': 'Start time must be in HH:mm format',
            'any.required': 'Start time is required',
        }),
    endTime: Joi.string()
        .default('23:59')
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.base': 'End time must be a string',
            'string.pattern.name': 'End time must be in HH:mm format',
            'any.required': 'End time is required',
        }),
    notifyWhen: Joi.string()
        .default(NOTIFY_WHEN.ONE_DAY_BEFORE)
        .valid(...Object.values(NOTIFY_WHEN))
        .optional()
        .messages({
            'string.base': 'NotifyWhen must be a string',
            'any.only': `Type must be one of ${Object.values(NOTIFY_WHEN).join(', ')}`,
        }),
    location: Joi.string().optional().messages({
        'string.base': 'Location must be a string',
    }),
    isPublic: Joi.boolean().required().messages({
        'boolean.base': 'isPublic must be a boolean',
        'any.required': 'isPublic is required',
    }),
    isOpen: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'isOpen must be a boolean',
    }),
});

/**
 * Validation Schema for Admin Event Creation
 *
 * Extends the regular event creation schema with additional fields for
 * administrative purposes. Allows admins to create events on behalf of users
 * by specifying an organizer.
 */
export const createEventAdminSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.base': 'Title must be a string',
        'any.required': 'Title is required',
    }),
    description: Joi.string().required().messages({
        'string.base': 'Description must be a string',
        'any.required': 'Description is required',
    }),
    type: Joi.string()
        .valid(...Object.values(EventType))
        .required()
        .messages({
            'string.base': 'Type must be a string',
            'any.only': `Type must be one of ${Object.values(EventType).join(', ')}`,
            'any.required': 'Type is required',
        }),
    startDate: Joi.date().iso().required().messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date',
        'any.required': 'End date is required',
    }),
    startTime: Joi.string()
        .default('00:00')
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.base': 'Start time must be a string',
            'string.pattern.name': 'Start time must be in HH:mm format',
            'any.required': 'Start time is required',
        }),
    endTime: Joi.string()
        .default('23:59')
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.base': 'End time must be a string',
            'string.pattern.name': 'End time must be in HH:mm format',
            'any.required': 'End time is required',
        }),
    notifyWhen: Joi.string()
        .default(NOTIFY_WHEN.ONE_DAY_BEFORE)
        .valid(...Object.values(NOTIFY_WHEN))
        .optional()
        .messages({
            'string.base': 'NotifyWhen must be a string',
            'any.only': `Type must be one of ${Object.values(NOTIFY_WHEN).join(', ')}`,
        }),
    location: Joi.string().optional().messages({
        'string.base': 'Location must be a string',
    }),
    isPublic: Joi.boolean().required().messages({
        'boolean.base': 'isPublic must be a boolean',
        'any.required': 'isPublic is required',
    }),
    organizer: Joi.string().required().messages({
        'string.base': 'Organizer (id) must be a string',
        'any.required': 'Organizer (id) is required',
    }),
    isOpen: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'isOpen must be a boolean',
    }),
});

/**
 * Validation Schema for Event Updates
 *
 * Defines validation rules for updating existing events by regular users.
 * All fields are optional, but at least one field must be provided.
 * Ensures data integrity when modifying event details.
 */
export const updateEventSchema = Joi.object({
    title: Joi.string().optional().messages({
        'string.base': 'Title must be a string',
    }),
    description: Joi.string().optional().messages({
        'string.base': 'Description must be a string',
    }),
    type: Joi.string()
        .valid(...Object.values(EventType))
        .optional()
        .messages({
            'string.base': 'Type must be a string',
            'any.only': `Type must be one of ${Object.values(EventType).join(', ')}`,
        }),
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid date',
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date',
    }),
    startTime: Joi.string()
        .default('00:00')
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.base': 'Start time must be a string',
            'string.pattern.name': 'Start time must be in HH:mm format',
            'any.required': 'Start time is required',
        }),
    endTime: Joi.string()
        .default('23:59')
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.base': 'End time must be a string',
            'string.pattern.name': 'End time must be in HH:mm format',
            'any.required': 'End time is required',
        }),
    notifyWhen: Joi.string()
        .default(NOTIFY_WHEN.ONE_DAY_BEFORE)
        .valid(...Object.values(NOTIFY_WHEN))
        .optional()
        .messages({
            'string.base': 'NotifyWhen must be a string',
            'any.only': `Type must be one of ${Object.values(NOTIFY_WHEN).join(', ')}`,
        }),
    location: Joi.string().optional().messages({
        'string.base': 'Location must be a string',
    }),
    existingImages: Joi.optional().messages({
        'array.base': 'existingImages must be an array of strings',
        'string.base': 'Each image must be a string',
    }),
    isPublic: Joi.boolean().optional().messages({
        'boolean.base': 'isPublic must be a boolean',
    }),
    isOpen: Joi.boolean().optional().messages({
        'boolean.base': 'isOpen must be a boolean',
    }),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

/**
 * Validation Schema for Admin Event Updates
 *
 * Extends the regular event update schema with additional fields for
 * administrative purposes. Allows admins to update events and change
 * the event organizer.
 */
export const updateEventAdminSchema = Joi.object({
    title: Joi.string().optional().messages({
        'string.base': 'Title must be a string',
    }),
    description: Joi.string().optional().messages({
        'string.base': 'Description must be a string',
    }),
    type: Joi.string()
        .valid(...Object.values(EventType))
        .optional()
        .messages({
            'string.base': 'Type must be a string',
            'any.only': `Type must be one of ${Object.values(EventType).join(', ')}`,
        }),
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid date',
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date',
    }),
    startTime: Joi.string()
        .default('00:00')
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.base': 'Start time must be a string',
            'string.pattern.name': 'Start time must be in HH:mm format',
            'any.required': 'Start time is required',
        }),
    endTime: Joi.string()
        .default('23:59')
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.base': 'End time must be a string',
            'string.pattern.name': 'End time must be in HH:mm format',
            'any.required': 'End time is required',
        }),
    notifyWhen: Joi.string()
        .default(NOTIFY_WHEN.ONE_DAY_BEFORE)
        .valid(...Object.values(NOTIFY_WHEN))
        .optional()
        .messages({
            'string.base': 'NotifyWhen must be a string',
            'any.only': `Type must be one of ${Object.values(NOTIFY_WHEN).join(', ')}`,
        }),
    location: Joi.string().optional().messages({
        'string.base': 'Location must be a string',
    }),
    existingImages: Joi.array().items(Joi.string()).optional().messages({
        'array.base': 'existingImages must be an array of strings',
        'string.base': 'Each image must be a string',
    }),
    isPublic: Joi.boolean().optional().messages({
        'boolean.base': 'isPublic must be a boolean',
    }),
    organizer: Joi.string().required().messages({
        'string.base': 'organizer (id) must be a string',
    }),
    isOpen: Joi.boolean().optional().messages({
        'boolean.base': 'isOpen must be a boolean',
    }),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

/**
 * Validation Schema for Event Join Requests
 *
 * Defines validation rules for users requesting to join an event.
 * Ensures that join requests include valid user identification.
 */
export const joinEventSchema = Joi.object({
    userId: Joi.string().required().messages({
        'string.base': 'User ID must be a string',
        'any.required': 'User ID is required',
    }),
    status: Joi.string()
        .optional()
        .valid(ParticipationStatus.INVITED)
        .messages({
            'string.base': 'Status must be a string',
            'any.only': `Status must be ${ParticipationStatus.INVITED}`,
        }),
});

/**
 * Validation Schema for Event Participation Responses
 *
 * Defines validation rules for users responding to event invitations.
 * Ensures that responses include valid user identification and participation status.
 */
export const respondEventSchema = Joi.object({
    userId: Joi.string().required().messages({
        'string.base': 'User ID must be a string',
        'any.required': 'User ID is required',
    }),
    status: Joi.string()
        .valid(ParticipationStatus.ACCEPTED, ParticipationStatus.DENIED)
        .required()
        .messages({
            'string.base': 'Status must be a string',
            'any.only': `Status must be either ${ParticipationStatus.ACCEPTED} or ${ParticipationStatus.DENIED}`,
            'any.required': 'Status is required',
        }),
});

export const updateIsOpenSchema = Joi.object({
    isOpen: Joi.boolean().required().messages({
        'boolean.base': 'isOpen must be a boolean',
        'any.required': 'isOpen is required',
    }),
});
