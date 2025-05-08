import { sendVerificationEmail } from '../helpers/email'

// In-memory store for temporary OTP data
const otpStorage = new Map<string, { code: string; expires: number }>();

export class OtpService {
    private static generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async sendOtp(email: string): Promise<void> {
        const code = this.generateOtp();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

        // Store OTP and expiration in memory
        otpStorage.set(email, { code, expires });

        // Send OTP via email
        await sendVerificationEmail(email, code);

    }

    static verifyOtp(email: string, code: string): boolean {
        const otpData = otpStorage.get(email);

        if (!otpData) {
            throw new Error('OTP not found or expired');
        }

        if (otpData.expires < Date.now()) {
            otpStorage.delete(email);
            throw new Error('OTP expired');
        }

        if (otpData.code !== code) {
            throw new Error('Invalid OTP');
        }

        // OTP is valid, remove it from storage
        otpStorage.delete(email);
        return true;
    }
}