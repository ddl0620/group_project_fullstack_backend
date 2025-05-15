import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { UserService } from '../services/user.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { validateInput } from '../helpers/validateInput';
import { updatePasswordSchema } from '../validation/user.validation';
import { StatusCode } from '../enums/statusCode.enums';

/**
 * UserController
 *
 * This controller handles all operations related to user management, including:
 * - Retrieving user information (current user, all users, specific user)
 * - Updating user data (basic information, password)
 * - Deleting user accounts
 *
 * All endpoints require authentication through AuthenticationRequest.
 */
export class UserController {
    /**
     * Retrieves the authenticated user's profile information
     *
     * This endpoint returns the complete profile of the currently authenticated user.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.user.userId - ID of the authenticated user
     * @returns {Promise<void>} - Returns the user profile through HttpResponse
     */
    async me(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await UserService.getCurrentUser(req.user?.userId as string);

            HttpResponse.sendYES(res, StatusCode.OK, 'Fetch user successfully', {
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves all users with pagination
     *
     * This endpoint fetches all users in the system with pagination and sorting options.
     * Typically restricted to admin users depending on service implementation.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of users per page (default: 10)
     * @param {string} req.query.sortBy - Sorting direction (default: 'desc')
     * @returns {Promise<void>} - Returns paginated users through HttpResponse
     */
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

            HttpResponse.sendYES(res, StatusCode.OK, 'Users fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves a specific user by ID
     *
     * This endpoint fetches a single user based on the provided user ID.
     * Access control may be implemented in the service layer.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.params.id - ID of the user to fetch
     * @returns {Promise<void>} - Returns the requested user through HttpResponse
     */
    async getUserById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const user = await UserService.getUserById(req.params?.id as string);
            console.log(user);
            HttpResponse.sendYES(res, StatusCode.OK, 'Users fetched successfully', user);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Updates the basic profile information of the authenticated user
     *
     * This endpoint allows users to update their profile information, including
     * file uploads (profile pictures, etc.). Certain fields are protected from
     * direct updates.
     *
     * @param req - AuthenticationRequest object containing authenticated user information and update data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.user.userId - ID of the authenticated user
     * @param {Object} req.body - User data to update
     * @param {Express.Multer.File[]} req.files - Uploaded files (if any)
     * @returns {Promise<void>} - Returns the updated user through HttpResponse
     */
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

            HttpResponse.sendYES(res, StatusCode.OK, 'User updated successfully', {
                user: updatedUser,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Updates the password of the authenticated user
     *
     * This endpoint allows users to change their password after validating
     * the input against the password schema requirements.
     *
     * @param req - AuthenticationRequest object containing authenticated user information and password data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.user.userId - ID of the authenticated user
     * @param {Object} req.body - Password update data (old password, new password)
     * @returns {Promise<void>} - Returns the updated user through HttpResponse
     */
    async updatePassword(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            validateInput(updatePasswordSchema, req.body);
            const updatedUser = await UserService.updatePassword(req.user?.userId as string, {
                ...req.body,
            });

            HttpResponse.sendYES(res, StatusCode.OK, 'Password updated successfully', {
                user: updatedUser,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Deletes the authenticated user's account
     *
     * This endpoint allows users to delete their own account from the system.
     * The actual deletion process may be handled differently in the service layer
     * (soft delete vs hard delete).
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.user.userId - ID of the authenticated user to delete
     * @returns {Promise<void>} - Returns the deleted user through HttpResponse
     */
    async deleteUser(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const deletedUser = await UserService.deleteUser(req.user?.userId as string);

            HttpResponse.sendYES(res, StatusCode.OK, 'User deleted successfully', {
                user: deletedUser,
            });
        } catch (err) {
            next(err);
        }
    }
}
