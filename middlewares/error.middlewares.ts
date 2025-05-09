import { Request, Response, NextFunction } from 'express';
import { createLogger, transports, format } from 'winston';
import { HttpError } from '../helpers/httpsError.helpers';
import { errorHandlers } from '../helpers/errorHandlers';

/**
 * Winston logger configuration for centralized error logging.
 *
 * Logs are written to:
 * - File: logs/error.log (for persistent storage)
 * - Console: For immediate visibility during development
 *
 * Log format includes timestamps and is structured as JSON for easier parsing.
 */
const logger = createLogger({
    level: 'error',
    format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
    transports: [
        new transports.File({ filename: 'logs/error.log' }),
        new transports.Console({
            format: format.combine(format.colorize(), format.simple(), format.prettyPrint()),
        }),
    ],
});

/**
 * Global Error Handling Middleware
 *
 * This middleware serves as the central error processor for the application.
 * It standardizes error responses across the API by:
 *
 * 1. Converting various error types to a consistent HttpError format
 * 2. Applying specific error handlers based on error name or code
 * 3. Logging errors with contextual information for debugging
 * 4. Sanitizing error details in production environments
 * 5. Returning standardized JSON error responses
 *
 * The middleware distinguishes between operational errors (4xx) and
 * programming/server errors (5xx), handling them appropriately based on
 * the environment.
 *
 * @param err - The error object thrown in the application or passed from previous middleware
 * @param req - Express request object containing request details
 * @param res - Express response object used to send the error response
 * @param _next - Express next function (unused as this is the final error handler)
 *
 * @returns void - Sends JSON response with appropriate status code and error details
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
