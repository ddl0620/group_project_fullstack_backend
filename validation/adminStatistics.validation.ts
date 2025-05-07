import Joi from 'joi';

export const eventsByDateSchema = Joi.object({
    startDate: Joi.date().iso().required().messages({
        'date.base': 'Start date must be a valid ISO date',
        'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().required().messages({
        'date.base': 'End date must be a valid ISO date',
        'any.required': 'End date is required',
    }),
});

export const usersByDateSchema = Joi.object({
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': 'End date must be a valid ISO date',
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
});

export const deletedUsersByDateSchema = Joi.object({
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': 'End date must be a valid ISO date',
    }),
});