import {JWT_EXPIRES_IN, JWT_SECRET} from "../config/env";
import jwt from "jsonwebtoken";

/**
 * Generates a JWT authentication token for a user
 * 
 * This utility function creates a signed JSON Web Token (JWT) containing
 * the user's ID. The token is signed with the application's JWT_SECRET and
 * configured to expire based on the JWT_EXPIRES_IN environment variable.
 *
 * @param {string} userId - The unique identifier of the user
 * @returns {string} A signed JWT token string
 * @throws {Error} May throw an error if JWT_SECRET is not properly configured
 */
export const generateToken = (userId: string): string => {
    // @ts-ignore
    return jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
}