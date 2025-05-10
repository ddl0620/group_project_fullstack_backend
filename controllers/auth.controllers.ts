import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { HttpResponse } from '../helpers/HttpResponse';
import { SignInResponse, SignInType, SignUpType } from '../types/auth.type';
import { signInSchema, signUpSchema } from '../validation/auth.validation';
import { validateInput } from '../helpers/validateInput';
import { OtpService } from '../services/otp.service';

/**
 * AuthControllers
 *
 * This controller handles all authentication-related operations including:
 * - User registration (sign up) with email verification
 * - User authentication (sign in)
 * - OTP verification for registration
 *
 * The authentication flow includes validation of input data, OTP verification,
 * and secure user creation and authentication processes.
 */
export class AuthControllers {
    /**
     * Initiates the user registration process
     *
     * This method validates the sign-up data, stores it temporarily,
     * and sends a verification code to the user's email address.
     *
     * @param request - Express Request object containing user registration data
     * @param response - Express Response object
     * @param nextFunction - Express NextFunction for error handling
     *
     * @param {SignUpType} request.body - User registration data validated against signUpSchema
     * @returns {Promise<void>} - Returns the sign-up data and sends OTP through HttpResponse
     */
    async signUp(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        try {
            validateInput(signUpSchema, request.body);

            await AuthService.initiateSignUp({
                ...(request.body as SignUpType),
                confirmPassword: request.body.password,
            });

            HttpResponse.sendYES(response, 200, 'Verification code sent for signup', {
                email: request.body.email,
            });
        } catch (err) {
            nextFunction(err);
        }
    }

    /**
     * Authenticates a user and generates access tokens
     *
     * This method validates the sign-in credentials, authenticates the user,
     * and generates access and refresh tokens for the authenticated session.
     *
     * @param request - Express Request object containing user credentials
     * @param response - Express Response object
     * @param nextFunction - Express NextFunction for error handling
     *
     * @param {SignInType} request.body - User credentials validated against signInSchema
     * @returns {Promise<void>} - Returns authentication tokens and user data through HttpResponse
     */
    async signIn(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        try {
            validateInput(signInSchema, request.body);
            const { email, password } = request.body as SignInType;
            const result: SignInResponse = await AuthService.validateCredentials({
                email,
                password,
            });
            response.cookie('jwt', result.token, {
                httpOnly: true, // Không cho JavaScript truy cập
                secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS trong production
                sameSite: 'none', // Ngăn CSRF
                maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie (ví dụ: 1 ngày)
            });

            HttpResponse.sendYES(response, 200, 'Login successful', result);
        } catch (err) {
            nextFunction(err);
        }
    }

    async sendVerification(
        request: Request,
        response: Response,
        nextFunction: NextFunction,
    ): Promise<void> {
        try {
            const { email } = request.body;
            await AuthService.sendVerificationCode(email);
            HttpResponse.sendYES(response, 200, 'Verification code sent successfully', { email });
        } catch (err) {
            nextFunction(err);
        }
    }

    async verifyCode(
        request: Request,
        response: Response,
        nextFunction: NextFunction,
    ): Promise<void> {
        try {
            const { email, code } = request.body;
            OtpService.verifyOtp(email, code);
            HttpResponse.sendYES(response, 200, 'Verification successful', { email, code });
        } catch (err) {
            nextFunction(err);
        }
    }

    /**
     * Verifies the OTP code and completes the user registration process
     *
     * This method validates the OTP code sent to the user's email,
     * retrieves the stored sign-up data, and creates a new user account.
     *
     * @param request - Express Request object containing email and verification code
     * @param response - Express Response object
     * @param nextFunction - Express NextFunction for error handling
     *
     * @param {string} request.body.email - User's email address
     * @param {string} request.body.code - Verification code sent to the user's email
     * @returns {Promise<void>} - Returns the created user data through HttpResponse
     */
    async verifySignUp(
        request: Request,
        response: Response,
        nextFunction: NextFunction,
    ): Promise<void> {
        try {
            const { email, code } = request.body;
            const result = await AuthService.completeSignUp(email, code);
            HttpResponse.sendYES(response, 201, 'User created successfully', result);
        } catch (err) {
            nextFunction(err);
        }
    }

    async signOut(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        try {
            response.clearCookie('jwt');
            HttpResponse.sendYES(response, 200, 'Logout successful', {});
        } catch (err) {
            nextFunction(err);
        }
    }
}
