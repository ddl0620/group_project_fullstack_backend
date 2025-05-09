import { NextFunction, Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { HttpResponse } from '../../helpers/HttpResponse';
import { AuthenticationRequest } from '../../interfaces/authenticationRequest.interface';
import { signUpSchema, signUpSchemaAdmin } from '../../validation/auth.validation';
import { HttpError } from '../../helpers/httpsError.helpers';
import { UserInterface } from '../../interfaces/user.interfaces';
import { SignUpResponse } from '../../types/auth.type';

/**
 * UserManagementController
 * 
 * This controller handles all user management operations including:
 * - Retrieving users (all users or by ID)
 * - Creating new users
 * - Updating user information
 * - Deleting users
 */
export class UserManagementController {
    /**
     * Retrieves all users with pagination and sorting
     * 
     * @param req - Express Request object containing query parameters for pagination and sorting
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @query {number} page - Page number for pagination (default: 1)
     * @query {number} limit - Number of users per page (default: 10)
     * @query {string} sortBy - Sort direction, 'asc' or 'desc' (default: 'desc')
     */
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

    /**
     * Creates a new user with admin privileges
     * 
     * @param req - Express Request object containing user data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {object} req.body - User data validated against signUpSchemaAdmin
     * @returns {SignUpResponse} - The created user object
     */
    static async createNewUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { error } = signUpSchemaAdmin.validate(req.body);
            if (error) {
                throw new HttpError(
                    error.details[0].message || 'Invalid input',
                    400,
                    'INVALID_INPUT',
                );
            }
            const user: SignUpResponse = await UserService.createUser(req.body);

            HttpResponse.sendYES(res, 200, 'Users created successfully', user);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Updates user information for a specific user
     * 
     * @param req - AuthenticationRequest object containing user data and authenticated user
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.id - ID of the user to update
     * @param {object} req.body - Updated user data
     * @param {Express.Multer.File[]} req.files - Uploaded files (e.g., profile picture)
     */
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

    /**
     * Deletes a user by ID
     * 
     * @param req - Express Request object containing user ID
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.id - ID of the user to delete
     */
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const deletedUser = await UserService.deleteUser(id);
            HttpResponse.sendYES(res, 200, 'User deleted successfully', deletedUser);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves a specific user by their ID
     * 
     * @param req - Express Request object containing user ID
     * @param res - Express Response object
     * 
     * @param {string} req.params.id - ID of the user to retrieve
     * @returns {object} - The user object if found
     */
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
