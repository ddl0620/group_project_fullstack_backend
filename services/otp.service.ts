import { SignUpType } from '../types/auth.type';
import { sendVerificationEmail } from '../helpers/email';

/**
 * In-memory storage for temporary sign-up data and OTP codes
 * 
 * Maps email addresses to their associated sign-up data, verification code,
 * and expiration timestamp.
 */
// In-memory store for temporary sign-up data and OTP
const tempStorage = new Map<
    string,
    { data: SignUpType; code: string; expires: number }
>();

/**
 * OTP Service
 * 
 * This service manages the generation, storage, and verification of one-time
 * passwords (OTPs) for user authentication processes such as sign-up and
 * password reset. It provides a secure way to verify user email addresses
 * before completing sensitive operations.
 */
export class OtpService {
    /**
     * Generates a random 6-digit OTP code
     * 
     * Creates a numeric code between 100000 and 999999 for verification purposes.
     * 
     * @returns {string} A 6-digit OTP code
     * @private
     */
    private static generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Stores sign-up data and sends verification OTP
     * 
     * Generates an OTP, stores it with the sign-up data in temporary storage,
     * and sends the code to the user's email address.
     * 
     * @param {SignUpType} data - User sign-up information including email
     * @returns {Promise<void>}
     */
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

    /**
     * Sends an OTP for verification purposes
     * 
     * Used for scenarios like password change or information updates.
     * Generates a new OTP and sends it to the specified email address,
     * updating existing data if present.
     * 
     * @param {string} email - Email address to send the OTP to
     * @returns {Promise<void>}
     */
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

    /**
     * Verifies an OTP and retrieves associated data
     * 
     * Checks if the provided code matches the stored OTP for the email address,
     * validates that the code hasn't expired, and returns the associated data
     * if verification is successful.
     * 
     * @param {string} email - Email address associated with the OTP
     * @param {string} code - OTP code to verify
     * @returns {Promise<SignUpType>} The sign-up data associated with the email
     * @throws {Error} If verification fails due to invalid code, expiration, or missing data
     */
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