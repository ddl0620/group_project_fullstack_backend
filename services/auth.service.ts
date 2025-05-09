import { SignInResponse, SignInType, SignUpResponse, SignUpType } from '../types/auth.type';
import { UserService } from './user.service';
import { OtpService } from './otp.service';
import {StatusCode} from "../enums/statusCode.enums";
import {ErrorCode} from "../enums/errorCode.enums";
import {HttpError} from "../helpers/httpsError.helpers";
import {NextFunction} from "express";
import {HttpResponse} from "../helpers/HttpResponse";

export class AuthService {
    static async validateCredentials(input: SignInType): Promise<SignInResponse> {
        const { email, password } = input;
        return await UserService.validateCredentials(email, password);
    }

    static async createUser(data: SignUpType): Promise<SignUpResponse> {
        return await UserService.createUser({
            ...data,
            confirmPassword: data.password,
        });
    }

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
        return await UserService.createUser(action.data);
    }

}
