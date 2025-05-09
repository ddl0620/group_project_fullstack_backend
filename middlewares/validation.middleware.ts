import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HttpError } from '../helpers/httpsError.helpers';

/**
 * Defines which part of the request to validate: body, query parameters, or URL parameters.
 */
type RequestLocation = 'body' | 'query' | 'params';

/**
 * Creates middleware for validating request data against a Joi schema.
 * 
 * This higher-order function returns middleware that validates the specified part of 
 * the request (body, query, or params) against the provided Joi schema. If validation 
 * fails, it throws an HttpError with details about the validation failures.
 * 
 * @param schema - Joi schema to validate the request data against
 * @param location - Which part of the request to validate (defaults to 'body')
 * @returns Express middleware function that performs the validation
 * 
 * @throws HttpError with 400 status code if validation fails
 */
export const validateRequest = (schema: Joi.ObjectSchema, location: RequestLocation = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const dataToValidate = req[location];
        const { error } = schema.validate(dataToValidate, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            throw new HttpError(errorMessage, 400, 'VALIDATION_ERROR');
        }
        next();
    };
};