import Joi from 'joi';
import { ParticipationStatus } from '../enums/participationStatus.enums';
import { EventType } from '../enums/eventType.enums';

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
    location: Joi.string().optional().messages({
        'string.base': 'Location must be a string',
    }),
    isPublic: Joi.boolean().required().messages({
        'boolean.base': 'isPublic must be a boolean',
        'any.required': 'isPublic is required',
    }),
});

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
});

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
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

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
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

export const joinEventSchema = Joi.object({
    userId: Joi.string().required().messages({
        'string.base': 'User ID must be a string',
        'any.required': 'User ID is required',
    }),
});

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
