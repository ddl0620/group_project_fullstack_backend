import { SignInResponse, SignInType, SignUpResponse, SignUpType } from '../types/auth.type';
import { UserService } from './user.service';
import { sendVerificationEmail } from '../helpers/email';

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
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Send the verification code via email
        await sendVerificationEmail(email, verificationCode);
    }

}
