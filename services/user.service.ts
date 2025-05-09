import { UserModel } from '../models/user.models';
import { HttpError } from '../helpers/httpsError.helpers';
import { UserInterface } from '../interfaces/user.interfaces';
import bcrypt from 'bcryptjs';
import { SignInResponse, SignUpResponse, SignUpType } from '../types/auth.type';
import { ImageUploadService } from './imageUpload.service';
import { generateToken } from '../helpers/jwtGenerate.helper';
import { UpdatePasswordInput, UpdateUserInput, UserListResponse } from '../types/user.types';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';

/**
 * User Service
 * 
 * This service handles all user-related operations including user creation,
 * authentication, profile management, and account administration. It provides
 * a centralized location for user business logic and data access.
 */
export class UserService {
    /**
     * Creates a new user account
     * 
     * Registers a new user with hashed password and generates an authentication token.
     * Validates that the email is not already in use before creating the account.
     * 
     * @param {SignUpType} data - User registration data including email and password
     * @returns {Promise<SignUpResponse>} Created user object and authentication token
     * @throws {HttpError} If email already exists or user creation fails
     */
    static async createUser(data: SignUpType): Promise<SignUpResponse> {
        const existingUser: UserInterface | null = await UserModel.findOne({
            email: data.email.toLowerCase(),
        });
        if (existingUser) {
            throw new HttpError(
                'Email already exists',
                StatusCode.BAD_REQUEST,
                ErrorCode.CAN_NOT_CREATE,
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        try {
            const newUser: UserInterface | null = await UserModel.create({
                ...data,
                password: hashedPassword,
                avatar: '',
            });
            const token: string = generateToken(newUser.id.toString());

            return {
                user: newUser,
                token,
            };
        } catch (err) {
            throw new HttpError(
                'Failed to create user',
                StatusCode.BAD_REQUEST,
                ErrorCode.CAN_NOT_CREATE,
            );
        }
    }

    /**
     * Retrieves the current user's profile
     * 
     * Fetches the user profile for the authenticated user, excluding the password field.
     * 
     * @param {string} userId - ID of the current user
     * @returns {Promise<UserInterface>} User profile data
     * @throws {HttpError} If user not found or has been deleted
     */
    // Read: Lấy thông tin user hiện tại
    static async getCurrentUser(userId: string): Promise<UserInterface> {
        const user: UserInterface | null = await UserModel.findOne({
            _id: userId,
            isDeleted: false,
        }).select('-password');

        if (!user) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    /**
     * Retrieves a paginated list of all users
     * 
     * Gets a list of users with pagination support and sorting options.
     * 
     * @param {number} page - Page number (default: 1)
     * @param {number} limit - Number of users per page (default: 10)
     * @param {string} sortBy - Sort direction, 'asc' or 'desc' (default: 'desc')
     * @returns {Promise<UserListResponse>} Paginated list of users and pagination metadata
     */
    static async getAllUsers(
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<UserListResponse> {
        const skip: number = (page - 1) * limit;
        const sortOrder: 1 | -1 = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const users: UserInterface[] | null = await UserModel.find()
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalUsers = await UserModel.countDocuments();

        return {
            users,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
            },
        };
    }

    /**
     * Retrieves a user by their ID
     * 
     * Fetches a specific user's profile data by ID, excluding the password field.
     * 
     * @param {string} userId - ID of the user to retrieve
     * @returns {Promise<UserInterface>} User profile data
     */
    static async getUserById(userId: string): Promise<UserInterface> {
        const user: UserInterface | null = await UserModel.findOne({
            _id: userId,
            isDeleted: false,
        }).select('-password');

        return user as UserInterface;
    }

    /**
     * Updates a user's profile information
     * 
     * Updates basic user information and avatar, with protection for restricted fields.
     * 
     * @param {string} userId - ID of the user to update
     * @param {UpdateUserInput} updateData - New user data
     * @param {Express.Multer.File[] | null} avatar - Optional avatar image file
     * @param {string[]} notAllowedFields - Fields that cannot be updated
     * @returns {Promise<UserInterface>} Updated user profile
     * @throws {HttpError} If user not found or restricted fields are attempted to be updated
     */
    static async updateBasicInformation(
        userId: string,
        updateData: UpdateUserInput,
        avatar: Express.Multer.File[] | null,
        notAllowedFields: string[],
    ): Promise<UserInterface> {
        const updatedFields: string[] = Object.keys(updateData);
        const isValidOperation: boolean = updatedFields.every(
            field => !notAllowedFields.includes(field),
        );

        if (!isValidOperation) {
            throw new HttpError(
                'Cannot update restricted fields',
                StatusCode.BAD_REQUEST,
                ErrorCode.FORBIDDEN,
            );
        }

        const files: Express.Multer.File[] | null = avatar;

        const user: UserInterface | null = await UserModel.findById(userId);

        if (!user) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        let newAvatar: string = user.avatar;
        if (files && files.length > 0) {
            const converted: string[] = await ImageUploadService.convertFileToURL(
                files,
                'user',
                userId,
            );
            newAvatar = converted[0];
        }

        const updatedUser: UserInterface | null = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    ...updateData,
                    avatar: newAvatar,
                },
            },
            { new: true, runValidators: true },
        ).select('-password');

        if (!updatedUser) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        return updatedUser;
    }

    /**
     * Updates a user's password
     * 
     * Changes a user's password after verifying the current password.
     * 
     * @param {string} userId - ID of the user
     * @param {UpdatePasswordInput} data - Current and new password
     * @returns {Promise<UserInterface>} Updated user profile
     * @throws {HttpError} If user not found or current password is incorrect
     */
    static async updatePassword(userId: string, data: UpdatePasswordInput): Promise<UserInterface> {
        const user: UserInterface | null = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        const isMatchPassword: boolean = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatchPassword) {
            throw new HttpError(
                'Current password is incorrect',
                StatusCode.BAD_REQUEST,
                ErrorCode.INVALID_PASSWORD,
            );
        }

        const salt: string = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(data.newPassword, salt);

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    password: hashedNewPassword,
                },
            },
            { new: true, runValidators: true },
        ).select('-password');

        if (!updatedUser) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        return updatedUser;
    }

    /**
     * Soft deletes a user account
     * 
     * Marks a user as deleted without removing them from the database.
     * 
     * @param {string} userId - ID of the user to delete
     * @returns {Promise<UserInterface>} The deleted user profile
     * @throws {HttpError} If user not found or already deleted
     */
    // Delete: Xóa user
    static async deleteUser(userId: string): Promise<UserInterface> {
        const user: UserInterface | null = await UserModel.findOne({
            _id: userId,
            isDeleted: false,
        });

        if (!user) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        const deletedUser: UserInterface | null = await UserModel.findByIdAndUpdate(
            userId,
            { isDeleted: true },
            { new: true, runValidators: true },
        ).select('-password');

        if (!deletedUser) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        return deletedUser;
    }

    /**
     * Validates user credentials for authentication
     * 
     * Verifies email and password combination and generates an authentication token.
     * 
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<SignInResponse>} User profile and authentication token
     * @throws {HttpError} If user not found, deleted, or password is incorrect
     */
    static async validateCredentials(email: string, password: string): Promise<SignInResponse> {
        const user: UserInterface | null = await UserModel.findOne({
            email: email.toLowerCase(),
            isDeleted: false,
        });
        if (!user) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        const isValidPassword: boolean = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new HttpError(
                'Invalid password',
                StatusCode.BAD_REQUEST,
                ErrorCode.INVALID_PASSWORD,
            );
        }
        const token: string = generateToken(user.id.toString());

        return {
            user,
            token,
        };
    }
}
