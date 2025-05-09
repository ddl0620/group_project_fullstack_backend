import nodemailer from 'nodemailer';

// Interface for email options
interface EmailOptions {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    from?: string;
}

// Initialize transporter once for reuse
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
