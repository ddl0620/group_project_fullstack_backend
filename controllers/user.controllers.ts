import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { UserService } from '../services/user.service';
import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";

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

    async getAllUsers(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
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

    async getUserById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await UserService.getUserById(req.params?.id as string);

            HttpResponse.sendYES(res, 200, 'Users fetched successfully', user);
        } catch (err) {
            next(err);
        }
    }

    async updateInfor(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const updatedUser = await UserService.updateUser(req.user?.userId as string, req.body);

            HttpResponse.sendYES(res, 200, 'User updated successfully', {
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