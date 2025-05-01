import mongoose from 'mongoose';
import { UserModel } from '../models/user.models';
import { HttpError } from '../helpers/httpsError.helpers';
import { UserInterface } from '../interfaces/user.interfaces';
import bcrypt from 'bcryptjs';
import { SignUpType } from '../types/auth.type';
import { ImageUploadService } from './imageUpload.service';

interface UpdateUserInput {
    name?: string;
    email?: string;
    dateOfBirth?: Date;
}

interface UserListResponse {
    users: UserInterface[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalUsers: number;
    };
}

export class UserService {
    // Create: Tạo user mới (chuyển từ auth.service.ts)
    static async createUser(data: SignUpType): Promise<UserInterface> {
        const { name, email, password, role } = data;

        // Kiểm tra email đã tồn tại
        const existingUser = await UserModel.findOne({
            email: email,
        });
        console.log(existingUser);
        if (existingUser) {
            throw new HttpError('Email already exists', 400, 'EMAIL_EXISTS');
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const newUser = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                dateOfBirth: data.dateOfBirth,
                role,
                avatar: '',
            });
            return newUser;
        } catch (err) {
            throw new HttpError('Failed to create user', 500, 'CREATE_USER_FAILED');
        }
    }

    // Read: Lấy thông tin user hiện tại
    static async getCurrentUser(userId: string): Promise<UserInterface> {
        const user = await UserModel.findOne({
            _id: userId,
            isDeleted: false,
        }).select('-password');
        if (!user) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }
        return user;
    }

    // Read: Lấy danh sách user (phân trang)
    static async getAllUsers(
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<UserListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const users = await UserModel.find()
            .select('-password')
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
        const user = await UserModel.findOne({
            _id: userId,
            isDeleted: false,
        }).select('-password');

        return user as UserInterface;
    }

    // Update: Cập nhật thông tin user
    static async updateBasicInformation(
        userId: string,
        updateData: UpdateUserInput,
        avatar: Express.Multer.File[] | null,
    ): Promise<UserInterface> {
        const notAllowedFields = ['password', 'userId', 'role', 'confirmPassword'];
        const updatedFields = Object.keys(updateData);
        const isValidOperation = updatedFields.every(field => !notAllowedFields.includes(field));

        if (!isValidOperation) {
            throw new HttpError('Cannot update restricted fields', 400, 'INVALID_UPDATE_FIELD');
        }

        // if (updateData.email) {
        //     const existingUser = await UserModel.findOne({
        //         email: updateData.email,
        //         _id: { $ne: userId },
        //     });
        //     if (existingUser) {
        //         throw new HttpError('Email already exists', 400, 'EMAIL_EXISTS');
        //     }
        // }

        const files: Express.Multer.File[] | null = avatar;

        const user: UserInterface | null = await UserModel.findOne({
            email: updateData.email,
        });

        if (!user) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
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

        const updatedUser = await UserModel.findByIdAndUpdate(
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
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        return updatedUser;
    }

    static async updatePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
        confirmPassword: string,
    ): Promise<UserInterface> {
        const user: UserInterface | null = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        const isMatchPassword: boolean = await bcrypt.compare(currentPassword, user.password);
        if (!isMatchPassword) {
            throw new HttpError('Current password is incorrect', 400, 'INVALID_PASSWORD');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

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
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        return updatedUser;
    }

    // Delete: Xóa user
    static async deleteUser(userId: string): Promise<UserInterface> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const user = await UserModel.findOne({
            _id: userId,
            isDeleted: false,
        });

        if (!user) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        const deletedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isDeleted: true },
            { new: true, runValidators: true },
        ).select('-password');

        if (!deletedUser) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        return deletedUser;
    }

    // Validate credentials (chuyển từ auth.service.ts)
    static async validateCredentials(email: string, password: string): Promise<UserInterface> {
        const user = await UserModel.findOne({
            email: email.toLowerCase(),
            isDeleted: false,
        });
        if (!user) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        const isValidPassword: boolean = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new HttpError('Invalid password', 401, 'INVALID_PASSWORD');
        }

        return user;
    }
}
