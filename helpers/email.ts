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


// Interface for email options
interface EmailOptions {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    from?: string;
}

// Initialize transporter once for reuse

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
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
    },
});


// Generic sendEmail function
export const sendEmail = async ({
    to,
    subject,
    text,
    html,
    from = process.env.EMAIL_USER as string,
}: EmailOptions): Promise<nodemailer.SentMessageInfo> => {
    const mailOptions: nodemailer.SendMailOptions = {
        from,
        to,
        subject,
        text,
        html,
    };

    try {
        return await transporter.sendMail(mailOptions);
    } catch (error: any) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// Specialized function for OTP verification emails
export const sendVerificationEmail = async (
    to: string | string[],
    code: string,
): Promise<nodemailer.SentMessageInfo> => {
    const subject = 'OTP Verification Code';
    const text = `Your OTP verification code is: ${code}`;
    const html = `<p>Your OTP verification code is: <strong>${code}</strong></p>`;

    return sendEmail({ to, subject, text, html });
};
