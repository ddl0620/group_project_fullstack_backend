import bcrypt from "bcryptjs";

/**
 * Password Encryption Comparison Utility
 * 
 * This module provides functionality to securely compare a plain text input
 * (like a password) against its encrypted/hashed version stored in the database.
 * It uses bcrypt's secure comparison method to prevent timing attacks.
 * 
 * @module utils/encryption
 */

/**
 * Compares a plain text input against an encrypted/hashed value to check for a match
 * 
 * This function safely compares user-provided data (like a password) against
 * its encrypted version (stored hash) using bcrypt's comparison method.
 * It handles validation to ensure both inputs exist before attempting comparison.
 * 
 * @async
 * @function isMatchEncrypt
 * @param {string} inputData - The plain text data to be compared (e.g., password from login form)
 * @param {string} destinationData - The encrypted/hashed data to compare against (e.g., hash from database)
 * @returns {Promise<boolean>} Promise resolving to true if the data matches, false otherwise
 */
export const isMatchEncrypt = async (
    inputData: string,
    destinationData: string,
) => {
    if (!inputData || !destinationData) {
        return false;
    }

    return await bcrypt.compare(inputData, destinationData)
};
