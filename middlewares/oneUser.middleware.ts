import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../helpers/httpsError.helpers';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';

/**
 * Extended Request interface that includes user information from authentication.
 * This allows TypeScript to recognize the user property added by authentication middleware.
 */

/**
 * Authorization middleware to ensure users can only access or modify their own resources.
 *
 * This middleware compares the user ID from the request parameters with the authenticated
 * user's ID from the token. It prevents users from accessing or modifying resources
 * that don't belong to them, implementing the principle of least privilege.
 *
 * @param request - Extended Express request object containing user authentication data
 * @param response - Express response object
 * @param nextFunction - Express next function for middleware chaining
 *
 * @throws HttpError with 404 status if no authenticated user is found
 * @throws HttpError with 403 status if the authenticated user doesn't match the requested resource owner
 */
export const onlySelf = (
    request: AuthenticationRequest,
    response: Response,
    nextFunction: NextFunction,
) => {
    if (!request.user) {
        new HttpError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (request.params.id !== request?.user?.userId) {
        return nextFunction(
            new HttpError('You are not authorized to do this', 403, 'UNAUTHORIZED'),
        );
    }

    nextFunction();
};
