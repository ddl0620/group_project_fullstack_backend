import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HttpError } from '../helpers/httpsError.helpers';

type RequestLocation = 'body' | 'query' | 'params';

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