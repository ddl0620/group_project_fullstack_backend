import jwt, {JwtPayload} from "jsonwebtoken";
/**
 * JWT Token Decoder Utility
 * 
 * This module provides functionality to decode and verify JWT tokens used for authentication.
 * It ensures tokens are valid and properly signed with the application's secret key.
 * 
 * @module utils/token
 */


/**
 * Decodes and verifies a JWT token
 * 
 * This function takes a JWT token string, verifies its signature using the application's
 * secret key, and returns the decoded payload if valid. It performs validation checks
 * to ensure the token and secret are provided before attempting verification.
 * 
 * @function decodeToken
 * @param {string} token - The JWT token to decode and verify
 * @returns {(string | JwtPayload)} The decoded token payload containing user information
 * @throws {Error} Throws an error if the token is not provided, invalid, or if JWT_SECRET is not defined
 */
export const decodeToken = (token: string): (string | JwtPayload) => {
    try {
        if(!token) throw new Error('Token is not provided');
        if(!process.env.JWT_SECRET)  throw new Error('JWT secret is not defined');

        const decoded: (string | JwtPayload) = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
}