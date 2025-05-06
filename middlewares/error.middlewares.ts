import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../helpers/httpsError.helpers';

// Define the same custom error type

const errorMiddleware = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    let error: HttpError = { ...err, message: err.message || 'Internal Server Error' };

    console.error(err);

    if (err.name === 'CastError') {
        error = new Error('Resource not found') as HttpError;
        error.statusCode = 404;
        error.code = 'RESOURCE_NOT_FOUND';
    }

    if (err.code === '11000' || (err as any).code === 11000) {
        // Handle Mongoose duplicate key error
        error = new HttpError('Duplicate field value entered', 400, 'DUPLICATE_KEY');
    }

    if (err.name === 'ValidationError') {
        const message = Object.values((err as any).errors || {})
            .map((value: any) => value.message)
            .join(', ');
        error = new HttpError(message, 400, 'VALIDATION_ERROR') as HttpError;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
    });
};

export default errorMiddleware;
