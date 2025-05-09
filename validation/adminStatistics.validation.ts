import Joi from 'joi';

/**
 * Validation Schema for Events by Date Range
 * 
 * Defines the validation rules for API endpoints that filter events by a date range.
 * Both start and end dates are required and must be in ISO format (YYYY-MM-DD).
 * This schema is typically used for reporting or filtering events within a specific timeframe.
 */
export const eventsByDateSchema = Joi.object({
    /**
     * Start date of the date range
     * 
     * Must be a valid ISO date string (e.g., "2023-01-01").
     * Used as the lower bound for filtering events by their date.
     */
    startDate: Joi.date().iso().required().messages({
        'date.base': 'Start date must be a valid ISO date',
        'any.required': 'Start date is required',
    }),
    /**
     * End date of the date range
     * 
     * Must be a valid ISO date string (e.g., "2023-12-31").
     * Used as the upper bound for filtering events by their date.
     */
    endDate: Joi.date().iso().required().messages({
        'date.base': 'End date must be a valid ISO date',
        'any.required': 'End date is required',
    }),
});

/**
 * Validation Schema for Users by Date Range with Pagination
 * 
 * Defines the validation rules for API endpoints that retrieve users created or modified
 * within a specific date range. Includes pagination parameters for handling large result sets.
 * Date parameters are optional, allowing for open-ended queries.
 */
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

/**
 * Validation Schema for Deleted Users by Date Range
 * 
 * Defines the validation rules for API endpoints that retrieve soft-deleted users
 * within a specific date range. This schema is typically used for administrative
 * purposes such as auditing or data recovery.
 */
export const deletedUsersByDateSchema = Joi.object({
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': 'End date must be a valid ISO date',
    }),
});