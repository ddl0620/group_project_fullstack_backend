import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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