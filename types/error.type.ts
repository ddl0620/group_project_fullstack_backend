import { HttpError } from '../helpers/httpsError.helpers';

/**
 * Error Handler Type
 * 
 * Represents a function that processes any error and converts it into a standardized HttpError.
 * This type defines the contract for error handling functions used throughout the application
 * to ensure consistent error responses.
 * 
 * @param err - The error to be processed, can be of any type (Error object, string, unknown, etc.)
 * @returns A standardized HttpError object with appropriate status code and message
 */
export type ErrorHandler = {
    (err: any): HttpError;
};
