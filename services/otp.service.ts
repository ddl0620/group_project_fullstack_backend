import { sendVerificationEmail } from '../helpers/email';

// In-memory store for temporary OTP data and pending actions
const otpStorage = new Map<
    string,
    { code: string; expires: number; action?: { type: string; data: any } }
>();

export class OtpService {
    private static generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async sendOtp(
        email: string,
        action?: { type: string; data: any },
    ): Promise<void> {
        const code = this.generateOtp();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

        // Store OTP, expiration, and optional action data
        otpStorage.set(email, { code, expires, action });

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

        return true;
    }

    // Retrieve pending action and clear OTP data
    static getPendingAction(email: string): { type: string; data: any } | null {
        const otpData = otpStorage.get(email);
        if (!otpData || !otpData.action) {
            return null;
        }
        const action = otpData.action;
        otpStorage.delete(email); // Clear after retrieving
        return action;
    }

}