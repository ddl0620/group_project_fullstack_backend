import Joi from 'joi';

export const engagementStatsSchema = Joi.object({
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': 'End date must be a valid ISO date',
    }),
});

export const invitationsOverTimeSchema = Joi.object({
    startDate: Joi.date().iso().required().messages({
        'date.base': 'Start date must be a valid ISO date',
        'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().required().messages({
        'date.base': 'End date must be a valid ISO date',
        'any.required': 'End date is required',
    }),
    interval: Joi.string().valid('daily', 'weekly').optional().default('daily').messages({
        'string.base': 'Interval must be a string',
        'any.only': 'Interval must be either "daily" or "weekly"',
    }),
});

export const rsvpTrendSchema = Joi.object({
    startDate: Joi.date().iso().required().messages({
        'date.base': 'Start date must be a valid ISO date',
        'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().required().messages({
        'date.base': 'End date must be a valid ISO date',
        'any.required': 'End date is required',
    }),
    interval: Joi.string().valid('daily', 'weekly').optional().default('daily').messages({
        'string.base': 'Interval must be a string',
        'any.only': 'Interval must be either "daily" or "weekly"',
    }),
});

export const rsvpDistributionSchema = Joi.object({
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': 'End date must be a valid ISO date',
    }),
});

export const recipientsSchema = Joi.object({
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
    rsvpStatus: Joi.string().valid('ACCEPTED', 'DENIED', 'PENDING').optional().messages({
        'string.base': 'RSVP status must be a string',
        'any.only': 'RSVP status must be one of ACCEPTED, DENIED, PENDING',
    }),
    search: Joi.string().optional().messages({
        'string.base': 'Search must be a string',
    }),
});