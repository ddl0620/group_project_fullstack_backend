import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { EmailOptions, formatDate, loadHtmlTemplate, transporter } from './email.config';
import { EventInterface } from '../interfaces/event.interfaces';

// Placeholder for EventType enum (replace with actual enum if available)

// Helper function to read and replace placeholders in HTML templates

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
        const info = await transporter.sendMail(mailOptions);
        return info;
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
    const html = loadHtmlTemplate('otp-verification.html', {
        code,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};

// Function for sending event notification emails using EventInterface
export const sendEventNotificationEmail = async (
    to: string | string[],
    event: EventInterface,
): Promise<nodemailer.SentMessageInfo> => {
    const { title, description, type, startDate, endDate, location, isPublic } = event;

    // Format dates for display

    const subject = `You're Invited: ${title} (${type})`;
    const text = `Join us for ${title}!\n\nType: ${type}\nStart: ${formatDate(startDate)}\nEnd: ${formatDate(endDate)}\nLocation: ${location || 'TBD'}\nDescription: ${description}\nPublic: ${isPublic ? 'Yes' : 'No'}\n`;

    const html = loadHtmlTemplate('event-notification.html', {
        title,
        type,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        location: location || 'To Be Determined',
        description,
        isPublic: isPublic ? 'Yes' : 'No',
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};

// Function for sending event updated email
export const sendEventUpdatedEmail = async (
    to: string | string[],
    event: EventInterface,
    rsvpLink: string = 'https://example.com/event-details', // Optional with a default value
): Promise<nodemailer.SentMessageInfo> => {
    const { title, startDate, location } = event;

    const subject = `Event Updated: ${title}`;
    const text = `The event ${title} has been updated.\n\nStart Date: ${formatDate(startDate)}\nLocation: ${location || 'TBD'}`;
    const html = loadHtmlTemplate('event-updated.html', {
        title,
        startDate: formatDate(startDate),
        location: location || 'To Be Determined',
        rsvpLink,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};

// Function for sending event deleted email
export const sendEventDeletedEmail = async (
    to: string | string[],
    event: EventInterface,
): Promise<nodemailer.SentMessageInfo> => {
    const { title } = event;

    const subject = `Event Cancelled: ${title}`;
    const text = `We regret to inform you that the event ${title} has been cancelled.`;
    const html = loadHtmlTemplate('event-deleted.html', {
        title,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};
