import Joi from 'joi';

export const createInvitationSchema = Joi.object({
    content: Joi.string().optional().messages({
        'string.base': 'Content must be a string',
    }),
    eventId: Joi.string().required().messages({
        'string.base': 'Event ID must be a string',
        'any.required': 'Event ID is required',
    }),
    inviteeId: Joi.string().required().messages({
        'string.base': 'Invitee ID must be a string',
        'any.required': 'Invitee ID is required',
    }),
});

export const getInvitationsByEventIdSchema = Joi.object({
    eventId: Joi.string().required().messages({
        'string.base': 'Event ID must be a string',
        'any.required': 'Event ID is required',
    }),
    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).optional().default(10).messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
    }),
    sortBy: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
        'string.base': 'SortBy must be a string',
        'any.only': 'SortBy must be either "asc" or "desc"',
    }),
});