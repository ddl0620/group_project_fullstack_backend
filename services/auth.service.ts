import { UserModel } from '../models/user.models';
import { isMatchEncrypt } from '../helpers/compareEncrypt';
import { UserInterface } from '../interfaces/user.interfaces';
import { SignInType, SignUpType } from '../types/auth.type';
import bcrypt from 'bcryptjs';
import { HttpError } from '../helpers/httpsError.helpers';
import mongoose from 'mongoose';

export class AuthService {
    static async validateCredentials(
        input: SignInType
    ): Promise<UserInterface> {
        const { email, password } = input;

        // Validation
        if (!email || !password) {
            throw new HttpError(
                'Email and password are required',
                400,
                'MISSING_CREDENTIALS'
            );
        }

        if (!email.includes('@') || !email.includes('.')) {
            throw new HttpError('Invalid email format', 400, 'INVALID_EMAIL');
        }

        if (password.length < 6) {
            throw new HttpError(
                'Password must be at least 6 characters',
                400,
                'INVALID_PASSWORD'
            );
        }

        // Kiểm tra user tồn tại
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        // Kiểm tra password
        const isValidPassword: boolean = await isMatchEncrypt(
            password,
            user.password
        );
        if (!isValidPassword) {
            throw new HttpError('Invalid password', 401, 'INVALID_PASSWORD');
        }

        return user;
    }

    static async createUser(data: SignUpType): Promise<UserInterface> {
        const { name, email, password, confirmPassword, role } = data;

        // Validation
        if (!name || !email || !password || !confirmPassword || !role) {
            throw new HttpError(
                'All fields are required',
                400,
                'MISSING_FIELDS'
            );
        }

        if (password !== confirmPassword) {
            throw new HttpError(
                'Passwords do not match',
                400,
                'PASSWORDS_DO_NOT_MATCH'
            );
        }

        // Kiểm tra email
        if (!(await this.isValidEmail(email))) {
            throw new HttpError(
                'Email is invalid or already exists',
                400,
                'INVALID_EMAIL'
            );
        }

        // Kiểm tra password
        if (!(await this.isValidPassword(password))) {
            throw new HttpError(
                'Password must be at least 6 characters',
                400,
                'INVALID_PASSWORD'
            );
        }

        // Tạo user mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const newUser = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                role,
            });

            await session.commitTransaction();
            return newUser;
        } catch (err) {
            await session.abortTransaction();
            throw new HttpError(
                'Failed to create user',
                500,
                'CREATE_USER_FAILED'
            );
        } finally {
            await session.endSession();
        }
    }

    static async isValidEmail(email: string): Promise<boolean> {
        if (!email) {
            throw new HttpError('Email is required', 400, 'MISSING_EMAIL');
        }
        if (!email.includes('@') || !email.includes('.')) {
            throw new HttpError(
                'Invalid email format',
                400,
                'INVALID_EMAIL_FORMAT'
            );
        }
        const user = await UserModel.findOne({ email });
        if (user) {
            throw new HttpError('Email already exists', 400, 'EMAIL_EXISTS');
        }

        return true;
    }

    static async isValidPassword(password: string): Promise<boolean> {
        if (!password) {
            throw new HttpError(
                'Password is required',
                400,
                'MISSING_PASSWORD'
            );
        }
        if (password.length < 6) {
            throw new HttpError(
                'Password must be at least 6 characters',
                400,
                'INVALID_PASSWORD_LENGTH'
            );
        }
        return true;
    }
}
