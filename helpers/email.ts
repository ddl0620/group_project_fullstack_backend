import nodemailer from 'nodemailer';
/**
 * Email Service Utility
 * 
 * This module provides email sending capabilities for the application,
 * specifically for user verification purposes. It uses Nodemailer with
 * Gmail as the email service provider.
 * 
 * Environment variables required:
 * - EMAIL_USER: Gmail account username used to send emails
 * - EMAIL_PASS: Authentication password or app-specific password
 * 
 * @module services/email
 */

/**
 * Email transport configuration using Gmail service
 * The transporter is configured with credentials from environment variables
 * for secure email sending operations.
 * 
 * @private
 */
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a verification email containing an OTP code to the specified recipient
 * 
 * This function creates and sends an email with a verification code for user authentication.
 * The email is sent in both plain text and HTML formats for compatibility across email clients.
 * 
 * @async
 * @function sendVerificationEmail
 * @param {string} to - The recipient's email address
 * @param {string} code - The OTP verification code to be included in the email
 * @returns {Promise<any>} The information object returned by Nodemailer after sending the email
 * @throws {Error} Throws an error if the email sending fails
 */
export const sendVerificationEmail = async (
    to: string,
    code: string,
) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'OTP Verification Code',
        text: `Your OTP verification code is: ${code}`,
        html: `<p>Your OTP verification code is: <strong>${code}</strong></p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {

        throw new Error(`Failed to send email: ${error}`);
    }
};