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

export class UserService {
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

    static async getUserById(userId: string): Promise<UserInterface> {
        const user: UserInterface | null = await UserModel.findOne({
            _id: userId,
            isDeleted: false,
        }).select('-password');

        return user as UserInterface;
    }

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

    static async checkUserExists(email: string): Promise<UserInterface | null> {
        return await UserModel.findOne({ email: email.toLowerCase() });
    }
}
