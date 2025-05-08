import { SignUpType } from '../types/auth.type';
import { sendVerificationEmail } from '../helpers/email';

// In-memory store for temporary sign-up data and OTP
const tempStorage = new Map<
    string,
    { data: SignUpType; code: string; expires: number }
>();

export class OtpService {
    private static generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async storeSignUpDataAndSendOtp(data: SignUpType): Promise<void> {
        const code = this.generateOtp();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

        tempStorage.set(data.email, {
            data,
            code,
            expires,
        });

        await sendVerificationEmail(data.email, code);
    }


    //use in case change password or information
    static async sendOtp(email: string): Promise<void> {
        const code = this.generateOtp();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

        const existing = tempStorage.get(email);
        if (existing) {
            tempStorage.set(email, { ...existing, code, expires });
        } else {
            tempStorage.set(email, { data: { email } as SignUpType, code, expires });
        }

        await sendVerificationEmail(email, code);
    }

    static async verifyOtpAndGetData(email: string, code: string): Promise<SignUpType> {
        const stored = tempStorage.get(email);
        if (!stored) {
            throw new Error('No verification data found for this email');
        }

        if (stored.expires < Date.now()) {
            tempStorage.delete(email);
            throw new Error('Verification code has expired');
        }

        if (stored.code !== code) {
            throw new Error('Invalid verification code');
        }

        const signUpData = stored.data;
        tempStorage.delete(email);
        return signUpData;
    }
}