import { Request, Response, NextFunction } from 'express';
import { createLogger, transports, format } from 'winston';
import { HttpError } from '../helpers/httpsError.helpers';
import { errorHandlers } from '../helpers/errorHandlers';

/**
 * Logger configuration for error logging.
 */
const logger = createLogger({
    level: 'error',
    format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
    transports: [
        new transports.File({ filename: 'logs/error.log' }),
        new transports.Console(), // For development
    ],
});

/**
 * Express middleware for handling errors and sending standardized error responses.
 * @param err - The error object thrown or passed to the middleware.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param _next - Express next function (unused).
 */
export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction): void {
    // Determine if the environment is production
    const isProduction = process.env.NODE_ENV === 'production';

    // Default to generic error if not an HttpError instance
    let error: HttpError =
        err instanceof HttpError
            ? err
            : new HttpError(err.message || 'Internal Server Error', 500, 'UNKNOWN_ERROR');

    // Apply specific error handler if available
    const handler = errorHandlers[err.name] || errorHandlers[err.code];
    if (handler) {
        error = handler(err);
    }

    // Log the error with context
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
    });

    // Prepare response
    const statusCode = error.statusCode || 500;
    const response: Record<string, any> = {
        success: false,
        message: isProduction && statusCode >= 500 ? 'Internal Server Error' : error.message,
        code: error.code || 'UNKNOWN_ERROR',
    };

    // Include stack trace in development
    if (!isProduction) {
        response.stack = err.stack;
    }

    // Send response
    res.status(statusCode).json(response);
}

export default errorMiddleware;
