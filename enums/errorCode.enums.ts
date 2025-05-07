/**
 * Enum for standardized error codes used in the application.
 * These codes correspond to error handlers in the errorHandlers registry.
 */
export enum ErrorCode {
    // Mongoose errors
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    DUPLICATE_KEY = 'DUPLICATE_KEY',
    VALIDATION_ERROR = 'VALIDATION_ERROR',

    // JWT errors
    INVALID_TOKEN = 'INVALID_TOKEN',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',

    // Bcrypt errors
    BCRYPT_ERROR = 'BCRYPT_ERROR',

    // Authentication errors
    NO_TOKEN = 'NO_TOKEN',
    SERVER_CONFIG_ERROR = 'SERVER_CONFIG_ERROR',
    INVALID_TOKEN_PAYLOAD = 'INVALID_TOKEN_PAYLOAD',
    ACCESS_DENIED = 'ACCESS_DENIED',
    AUTH_ERROR = 'AUTH_ERROR',
    NO_SECRET_JWT = 'NO_SECRET_JWT',

    // Common errors
    INVALID_PASSWORD = 'INVALID_PASSWORD',
    INVALID_INPUT = 'INVALID_INPUT',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',

    // Custom errors
    CUSTOM_ERROR = 'CUSTOM_ERROR',
}
