import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { UserService } from '../services/user.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { HttpError } from '../helpers/httpsError.helpers';

export class UserController {
    async me(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await UserService.getCurrentUser(req.user?.userId as string);

            HttpResponse.sendYES(res, 200, 'Fetch user successfully', {
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAllUsers(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await UserService.getAllUsers(page, limit, sortBy);

            HttpResponse.sendYES(res, 200, 'Users fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getUserById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const user = await UserService.getUserById(req.params?.id as string);

            HttpResponse.sendYES(res, 200, 'Users fetched successfully', user);
        } catch (err) {
            next(err);
        }
    }

    async updateBasicInformation(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const notAllowedFields = [
                'password',
                'userId',
                'role',
                'maxEventCreate',
                'maxParticipantPerEvent',
            ];
            const updatedUser = await UserService.updateBasicInformation(
                req.user?.userId as string,
                req.body,
                req.files as Express.Multer.File[],
                notAllowedFields,
            );

            HttpResponse.sendYES(res, 200, 'User updated successfully', {
                user: updatedUser,
            });
        } catch (err) {
            next(err);
        }
    }

    async updatePassword(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            if (!currentPassword || !newPassword || !confirmPassword) {
                return next(
                    new HttpError(
                        'Please provide current password, new password and confirm password',
                        400,
                    ),
                );
            }
            const updatedUser = await UserService.updatePassword(
                req.user?.userId as string,
                currentPassword,
                newPassword,
                confirmPassword,
            );

            HttpResponse.sendYES(res, 200, 'Password updated successfully', {
                user: updatedUser,
            });
        } catch (err) {
            next(err);
        }
    }

    async deleteUser(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const deletedUser = await UserService.deleteUser(req.user?.userId as string);

            HttpResponse.sendYES(res, 200, 'User deleted successfully', {
                user: deletedUser,
            });
        } catch (err) {
            next(err);
        }
    }
}
