import { SignInResponse, SignInType, SignUpResponse, SignUpType } from '../types/auth.type';
import { UserService } from './user.service';
import { sendVerificationEmail } from '../helpers/email';

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
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Send the verification code via email
        await sendVerificationEmail(email, verificationCode);
    }

}
