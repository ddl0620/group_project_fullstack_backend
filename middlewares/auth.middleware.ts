import { NextFunction, Response } from 'express';
import { HttpError } from '../helpers/httpsError.helpers';
import jwt from 'jsonwebtoken';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { USER_ROLE } from '../enums/role.enum';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';
import { UserModel } from '../models/user.models';

/**
 * Authentication middleware to verify JWT tokens
 *
 * Extracts the JWT token from the 'jwt' cookie, verifies its validity,
 * and attaches the authenticated user information to the request object.
 *
 * @param request - Extended Express request with authentication properties
 * @param response - Express response object
 * @param nextFunction - Express next middleware function
 * @returns void - Calls next middleware or error handler
 */
export const authenticationToken = async (
    request: AuthenticationRequest,
    response: Response,
    nextFunction: NextFunction,
) => {
    const token: string | undefined = request.cookies?.jwt; // Lấy token từ cookie 'jwt'
    console.log('Token:', token);
    if (!token) {
        return nextFunction(
            new HttpError(
                'No token provided. Not today',
                StatusCode.UNAUTHORIZED,
                ErrorCode.NO_TOKEN,
            ),
        );
    }

    const secret: string | undefined = process.env.JWT_SECRET;
    if (!secret) {
        return nextFunction(
            new HttpError(
                'Server configuration error: JWT secret not set',
                StatusCode.FORBIDDEN,
                ErrorCode.NO_SECRET_JWT,
            ),
        );
    }

    try {
        const encoded = jwt.verify(token, secret);
        if (
            typeof encoded !== 'object' ||
            !encoded ||
            !('userId' in encoded) ||
            typeof encoded.userId !== 'string'
        ) {
            return nextFunction(
                new HttpError(
                    'Invalid token payload',
                    StatusCode.UNAUTHORIZED,
                    ErrorCode.INVALID_TOKEN_PAYLOAD,
                ),
            );
        }

        const user = await UserModel.findById(encoded.userId);
        if (!user) {
            return nextFunction(
                new HttpError(
                    `User id = ${encoded.userId} not found`,
                    StatusCode.NOT_FOUND,
                    ErrorCode.USER_NOT_FOUND,
                ),
            );
        }

        request.user = {
            userId: encoded.userId,
            role: user.role === 'admin' ? USER_ROLE.ADMIN : USER_ROLE.USER,
        };
        nextFunction();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return nextFunction(new HttpError('Token has expired', 401, 'TOKEN_EXPIRED'));
        } else if (err instanceof jwt.JsonWebTokenError) {
            return nextFunction(new HttpError('Invalid token', 401, 'INVALID_TOKEN'));
        }
        return nextFunction(new HttpError('Authentication error', 500, 'AUTH_ERROR'));
    }
};

/**
 * Admin-only access middleware
 *
 * Ensures that only users with admin role can access protected routes.
 * Must be used after authenticationToken middleware.
 *
 * @param request - Extended Express request with authentication properties
 * @param response - Express response object
 * @param nextFunction - Express next middleware function
 * @returns void - Calls next middleware or error handler
 */
export const adminOnlyMiddleware = (
    request: AuthenticationRequest,
    response: Response,
    nextFunction: NextFunction,
) => {
    const userRole: USER_ROLE | undefined = request.user?.role;

    if (userRole !== USER_ROLE.ADMIN || !userRole) {
        return nextFunction(
            new HttpError(
                'Only admin are allow to access this route!',
                StatusCode.UNAUTHORIZED,
                ErrorCode.ACCESS_DENIED,
            ),
        );
    }
    nextFunction();
};

/**
 * Regular user-only access middleware
 *
 * Ensures that only users with regular user role can access protected routes.
 * Must be used after authenticationToken middleware.
 *
 * @param request - Extended Express request with authentication properties
 * @param response - Express response object
 * @param nextFunction - Express next middleware function
 * @returns void - Calls next middleware or error handler
 */
export const userOnlyMiddleware = (
    request: AuthenticationRequest,
    response: Response,
    nextFunction: NextFunction,
) => {
    const userRole = request.user?.role;

    if (userRole !== USER_ROLE.USER) {
        return nextFunction(new HttpError('Access denied', 403, 'ACCESS_DENIED'));
    }

    nextFunction();
};
