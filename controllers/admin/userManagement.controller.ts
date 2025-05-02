import { NextFunction, Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { HttpResponse } from '../../helpers/HttpResponse';
import { AuthenticationRequest } from '../../interfaces/authenticationRequest.interface';

export class UserManagementController {
    // Method to get all users
    static async getAllUsers(req: Request, res: Response, next: NextFunction) {
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

    static async updateUserInformation(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const id = req.params.id;
            const notAllowedFields = ['password', 'userId'];
            const updatedUser = await UserService.updateBasicInformation(
                id,
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

    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const deletedUser = await UserService.deleteUser(id);
            HttpResponse.sendYES(res, 200, 'User deleted successfully', deletedUser);
        } catch (err) {
            next(err);
        }
    }

    // Method to get a user by ID
    static async getUserById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            // Logic to get a user by ID
            res.status(200).json({ message: `User with ID ${id} retrieved successfully` });
        } catch (error) {
            res.status(500).json({
                error: `An error occurred while retrieving user with ID ${id}`,
            });
        }
    }
}
