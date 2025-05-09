import { HttpError } from './httpsError.helpers';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';
/**
 * Validates that an object exists (is not null or undefined)
 * 
 * This utility function checks if a given object exists and throws a standardized
 * HttpError with NOT_FOUND status if the object is null or undefined. It's commonly
 * used to validate the existence of database query results or other required objects
 * before proceeding with operations.
 *
 * @param {any} object - The object to check for existence
 * @param {string} [message='Entity not found'] - Custom error message to include in the HttpError
 * @throws {HttpError} Throws an HttpError with NOT_FOUND status if the object doesn't exist
 * @returns {void} Does not return any value if validation passes
 */

export const isFoundObject = (object: any, message: string = 'Entity not found') => {
    if (!object) {
        throw new HttpError(message, StatusCode.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }
};
