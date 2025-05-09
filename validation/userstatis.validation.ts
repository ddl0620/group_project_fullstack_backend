import Joi from 'joi';

/**
 * Validation Schema for Engagement Statistics Query Parameters
 * 
 * Defines validation rules for filtering engagement statistics data.
 * Allows optional date range parameters to analyze engagement metrics within specific time periods.
 * Used for generating reports and dashboards showing user engagement with invitations.
 */
export const engagementStatsSchema = Joi.object({
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': 'End date must be a valid ISO date',
    }),
});

/**
 * Validation Schema for Invitations Over Time Report
 * 
 * Defines validation rules for generating time-series reports of invitation activity.
 * Requires specific date range parameters and allows customization of data aggregation intervals.
 * Used for visualizing invitation trends and patterns over specified time periods.
 */
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

/**
 * Validation Schema for RSVP Trend Analysis
 * 
 * Defines validation rules for generating time-series reports of RSVP responses.
 * Requires specific date range parameters and allows customization of data aggregation intervals.
 * Used for analyzing patterns in how recipients respond to invitations over time.
 */
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

/**
 * Validation Schema for RSVP Distribution Report
 * 
 * Defines validation rules for generating distribution reports of RSVP statuses.
 * Allows optional date range parameters to analyze RSVP distribution within specific time periods.
 * Used for visualizing the breakdown of invitation responses (accepted, denied, pending).
 */
export const rsvpDistributionSchema = Joi.object({
    startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': 'End date must be a valid ISO date',
    }),
});

/**
 * Validation Schema for Recipients Query Parameters
 * 
 * Defines validation rules for filtering and paginating recipient data.
 * Supports pagination, RSVP status filtering, and text search functionality.
 * Used for retrieving and displaying lists of invitation recipients with various filtering options.
 */
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