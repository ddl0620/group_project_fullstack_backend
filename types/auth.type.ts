import { USER_ROLE } from '../enums/role.enum';
import { UserInterface } from '../interfaces/user.interfaces';

/**
 * Sign In Request Type
 * 
 * Represents the data required for user authentication.
 * Contains the essential credentials needed to verify a user's identity.
 */
export type SignInType = {
    email: string;
    password: string;
};

/**
 * Sign In Response Type
 * 
 * Represents the data returned after successful authentication.
 * Contains the authenticated user information and access token.
 */
export type SignInResponse = {
    user: Partial<UserInterface>;
    token: string;
};

/**
 * Sign Up Request Type
 * 
 * Represents the data required for new user registration.
 * Contains all required fields to create a new user account.
 */
export type SignUpType = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: USER_ROLE;
    dateOfBirth: Date;
};

/**
 * Sign Up Response Type
 * 
 * Represents the data returned after successful user registration.
 * Contains the newly created user information and access token.
 */
export type SignUpResponse = {
    user: Partial<UserInterface>;
    token: string;
};
