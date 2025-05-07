import { NextFunction, Response } from 'express';
import { HttpError } from '../helpers/httpsError.helpers';
import jwt from 'jsonwebtoken';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { USER_ROLE } from '../enums/role.enum';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';

export const authenticationToken = (
    request: AuthenticationRequest,
    response: Response,
    nextFunction: NextFunction,
) => {
    const authHeader: string | undefined = request.headers['authorization'];
    const token: string | undefined = authHeader && authHeader.split(' ')[1];
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
        // console.log('encoded', encoded);
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

        request.user = {
            userId: encoded.userId,
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

export const adminOnlyMiddleware = (
    request: AuthenticationRequest,
    response: Response,
    nextFunction: NextFunction,
) => {
    const userRole: USER_ROLE | undefined = request.user?.role;

    //Commented for testing purposes

    if (userRole !== USER_ROLE.ADMIN && userRole) {
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
