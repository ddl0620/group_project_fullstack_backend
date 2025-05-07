/**
 * Custom HTTP error class for standardized error handling in Express applications.
 */
export class HttpError extends Error {
    /**
     * HTTP status code for the error (e.g., 404, 500).
     */
    public statusCode: number;
    /**
     * Optional error code for client-side handling (e.g., 'RESOURCE_NOT_FOUND').
     */
    public code?: string;

    /**
     * Creates an instance of HttpError.
     * @param message - The error message to be sent to the client.
     * @param statusCode - The HTTP status code (defaults to 500).
     * @param code - Optional error code for client-side handling.
     */
    constructor(message: string, statusCode: number = 500, code?: string) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, HttpError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
