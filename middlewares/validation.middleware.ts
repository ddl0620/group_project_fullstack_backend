import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HttpError } from '../helpers/httpsError.helpers';

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            throw new HttpError(errorMessage, 400, 'VALIDATION_ERROR');
        }
        next();
    };
};