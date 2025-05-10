import { SignInResponse, SignInType, SignUpResponse, SignUpType } from '../types/auth.type';
import { UserService } from './user.service';
import { OtpService } from './otp.service';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';
import { HttpError } from '../helpers/httpsError.helpers';
import { NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';

/**
 * Authentication Service
 *
 * This service handles user authentication operations including sign-in validation,
 * user registration, and email verification. It acts as a facade over the UserService
 * for authentication-specific operations.
 */
export class AuthService {
    /**
     * Validates user credentials for authentication
     *
     * Delegates to UserService to verify that the provided email and password
     * match an existing user account.
     *
     * @param {SignInType} input - Object containing email and password
     * @returns {Promise<SignInResponse>} Authentication result with user data and tokens
     * @throws Will throw an error if credentials are invalid or user doesn't exist
     */
    static async validateCredentials(input: SignInType): Promise<SignInResponse> {
        const { email, password } = input;
        return await UserService.validateCredentials(email, password);
    }

    /**
     * Creates a new user account
     *
     * Delegates to UserService to register a new user in the system.
     * Sets confirmPassword to match the provided password.
     *
     * @param {SignUpType} data - User registration data
     * @returns {Promise<SignUpResponse>} Registration result with user data
     * @throws Will throw an error if registration fails (e.g., email already exists)
     */
    static async createUser(data: SignUpType): Promise<SignUpResponse> {
        return await UserService.createUser({
            ...data,
            confirmPassword: data.password,
        });
    }

    /**
     * Generates and sends a verification code to the user's email
     *
     * Creates a random 6-digit verification code and sends it to the
     * specified email address using the email helper.
     *
     * @param {string} email - Email address to send verification code to
     * @returns {Promise<void>}
     * @throws Will throw an error if email sending fails
     */
    static async sendVerificationCode(email: string): Promise<void> {
        return await OtpService.sendOtp(email);
    }

    static async initiateSignUp(data: SignUpType): Promise<void> {
        // Check if user already exists
        const existingUser = await UserService.checkUserExists(data.email);
        if (existingUser) {
            throw new HttpError(
                'Email already exists',
                StatusCode.BAD_REQUEST,
                ErrorCode.CAN_NOT_CREATE,
            );
        }

        // Send OTP with signup action
        await OtpService.sendOtp(data.email, {
            type: 'signup',
            data: { ...data, confirmPassword: data.password },
        });
    }

    static async completeSignUp(email: string, code: string): Promise<SignUpResponse> {
        // Verify OTP
        const isValid = OtpService.verifyOtp(email, code);
        if (!isValid) {
            throw new HttpError('Invalid OTP', StatusCode.BAD_REQUEST, ErrorCode.AUTH_ERROR);
        }

        // Retrieve pending signup action
        const action = OtpService.getPendingAction(email);
        if (!action || action.type !== 'signup') {
            throw new HttpError(
                'No pending signup action',
                StatusCode.BAD_REQUEST,
                ErrorCode.AUTH_ERROR,
            );
        }

        // Create user
        return await AuthService.createUser(action.data);
    }
}
