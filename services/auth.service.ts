import { SignInResponse, SignInType, SignUpResponse, SignUpType } from '../types/auth.type';
import { UserService } from './user.service';
import { OtpService } from './otp.service';

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

}
