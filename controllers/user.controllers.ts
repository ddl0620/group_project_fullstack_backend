import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../helpers/httpsError.helpers';
import { UserService } from '../services/user.service';

interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
    };
}

export class UserController {
    async me(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        try {
            if (!request.user?.userId) {
                throw new HttpError(
                    'Authentication required',
                    401,
                    'AUTH_REQUIRED'
                );
            }

            const user = await UserService.getCurrentUser(request.user.userId);

            response.status(200).json({
                success: true,
                message: 'Fetch user successfully',
                data: {
                    user,
                },
            });
        } catch (err) {
            nextFunction(err);
        }
    }

    async updateInfor(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        try {
            if (!request.user?.userId) {
                throw new HttpError(
                    'Authentication required',
                    401,
                    'AUTH_REQUIRED'
                );
            }

            const updatedUser = await UserService.updateUser(
                request.user.userId,
                request.body
            );

            response.status(201).json({
                success: true,
                message: 'User updated successfully',
                updatedUser,
            });
        } catch (err) {
            nextFunction(err);
        }
    }
}
