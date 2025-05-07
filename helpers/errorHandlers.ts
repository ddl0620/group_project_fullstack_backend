import { HttpError } from './httpsError.helpers';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';
import { ErrorHandler } from '../types/error.type';

/**
 * Registry of error handlers for specific error types or codes.
 */
export const errorHandlers: Record<string, ErrorHandler> = {};

/**
 * Registers a new error handler for a specific error type or code.
 * @param errorType - The error type or code (e.g., 'CastError', ErrorCode.EVENT_NOT_FOUND).
 * @param handler - The handler function that returns an HttpError.
 */
export function registerErrorHandler(errorType: string, handler: ErrorHandler): void {
    errorHandlers[errorType] = handler;
}

// Common error handlers

// Mongoose errors
registerErrorHandler('CastError', () => {
    return new HttpError('Resource not found', StatusCode.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
});

registerErrorHandler('11000', (err: any) => {
    const field = Object.keys(err.keyValue || {})[0] || 'unknown field';
    const message = `Duplicate value entered for ${field}`;
    return new HttpError(message, StatusCode.BAD_REQUEST, ErrorCode.DUPLICATE_KEY);
});

registerErrorHandler('ValidationError', (err: any) => {
    const errors = err.errors || {};
    const message =
        Object.values(errors)
            .map((value: any) => value.message || 'Validation failed')
            .join(', ') || 'Validation failed';
    return new HttpError(message, StatusCode.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
});

// JWT errors
registerErrorHandler('JsonWebTokenError', () => {
    return new HttpError('Invalid token', StatusCode.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
});

registerErrorHandler('TokenExpiredError', () => {
    return new HttpError('Token has expired', StatusCode.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED);
});

// Bcrypt errors
registerErrorHandler('BcryptError', () => {
    return new HttpError(
        'Authentication error',
        StatusCode.INTERNAL_SERVER_ERROR,
        ErrorCode.BCRYPT_ERROR,
    );
});

// Authentication errors
registerErrorHandler(ErrorCode.NO_TOKEN, () => {
    return new HttpError('No token found.', StatusCode.UNAUTHORIZED, ErrorCode.NO_TOKEN);
});

registerErrorHandler(ErrorCode.SERVER_CONFIG_ERROR, () => {
    return new HttpError(
        'Server configuration error',
        StatusCode.INTERNAL_SERVER_ERROR,
        ErrorCode.SERVER_CONFIG_ERROR,
    );
});

registerErrorHandler(ErrorCode.INVALID_TOKEN_PAYLOAD, () => {
    return new HttpError(
        'Invalid token payload',
        StatusCode.UNAUTHORIZED,
        ErrorCode.INVALID_TOKEN_PAYLOAD,
    );
});

registerErrorHandler(ErrorCode.ACCESS_DENIED, () => {
    return new HttpError('Access denied', StatusCode.FORBIDDEN, ErrorCode.ACCESS_DENIED);
});

registerErrorHandler(ErrorCode.AUTH_ERROR, () => {
    return new HttpError(
        'Authentication error',
        StatusCode.INTERNAL_SERVER_ERROR,
        ErrorCode.AUTH_ERROR,
    );
});

// Common errors
registerErrorHandler(ErrorCode.INVALID_PASSWORD, () => {
    return new HttpError('Invalid password', StatusCode.UNAUTHORIZED, ErrorCode.INVALID_PASSWORD);
});

registerErrorHandler(ErrorCode.INVALID_INPUT, () => {
    return new HttpError('Invalid input provided', StatusCode.BAD_REQUEST, ErrorCode.INVALID_INPUT);
});

registerErrorHandler(ErrorCode.USER_NOT_FOUND, () => {
    return new HttpError('User does not exist', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
});

registerErrorHandler(ErrorCode.EVENT_NOT_FOUND, () => {
    return new HttpError('Event does not exist', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
});

registerErrorHandler(ErrorCode.UNAUTHORIZED, () => {
    return new HttpError('Unauthorized access', StatusCode.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
});

registerErrorHandler(ErrorCode.FORBIDDEN, () => {
    return new HttpError('Forbidden action', StatusCode.FORBIDDEN, ErrorCode.FORBIDDEN);
});

registerErrorHandler(ErrorCode.RESOURCE_NOT_FOUND, () => {
    return new HttpError(
        'Requested resource not found',
        StatusCode.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
    );
});

registerErrorHandler(ErrorCode.CUSTOM_ERROR, () => {
    return new HttpError(
        'Custom application error',
        StatusCode.BAD_REQUEST,
        ErrorCode.CUSTOM_ERROR,
    );
});
