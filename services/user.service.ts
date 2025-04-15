import mongoose from 'mongoose';
import { HttpError } from '../helpers/httpsError.helpers';
import { UserModel } from '../models/user.models';
import { UserInterface } from '../interfaces/user.interfaces';

// Định nghĩa kiểu dữ liệu cho dữ liệu cập nhật người dùng
interface UpdateUserInput {
    [key: string]: any;
}

export class UserService {
    // Lấy thông tin người dùng hiện tại
    static async getCurrentUser(userId: string): Promise<UserInterface> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await UserModel.findById(userId).select('-password');
            if (!user) {
                throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
            }

            await session.commitTransaction();
            return user;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            await session.endSession();
        }
    }

    // Cập nhật thông tin người dùng
    static async updateUser(
        userId: string,
        updateData: UpdateUserInput
    ): Promise<UserInterface> {
        // Kiểm tra các trường không được phép cập nhật
        const notAllowedFields = ['password', 'userId', 'role'];
        const updatedFields = Object.keys(updateData);
        const isValidOperation = updatedFields.every(
            (field) => !notAllowedFields.includes(field)
        );

        if (!isValidOperation) {
            throw new HttpError(
                'Invalid update field',
                400,
                'INVALID_UPDATE_FIELD'
            );
        }

        // Tìm và cập nhật người dùng
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        // Cập nhật các trường
        updatedFields.forEach((field) => {
            (user as any)[field] = updateData[field];
        });

        // Lưu thay đổi
        await user.save();
        return user;
    }
}
