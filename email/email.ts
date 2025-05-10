import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { EmailOptions, formatDate, loadHtmlTemplate, transporter } from './email.config';
import { EventInterface } from '../interfaces/event.interfaces';
import { HttpError } from '../helpers/httpsError.helpers';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';

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
        if (!to || to.length < 1) return;

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error: any) {
        throw new HttpError('Failed to send email', StatusCode.NOT_FOUND, ErrorCode.CAN_NOT_CREATE);
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

// Function for sending event notification emails
export const sendEventNotificationEmail = async (
    to: string | string[],
    event: EventInterface,
): Promise<nodemailer.SentMessageInfo> => {
    const { title, description, type, startDate, endDate, location, isPublic } = event;

    const subject = `Upcomming Event: ${title} (${type})`;
    const text = `Join us for ${title}!\n\nType: ${type}\nStart: ${formatDate(startDate)}\nEnd: ${formatDate(endDate)}\nLocation: ${location || 'TBD'}\nDescription: ${description}\nPublic: ${isPublic ? 'Yes' : 'No'}\n`;

    const html = loadHtmlTemplate('event-upcomming.html', {
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
    rsvpLink: string = 'https://example.com/event-details',
): Promise<nodemailer.SentMessageInfo> => {
    const { title, startDate, location, endDate } = event;

    const subject = `Event Updated: ${title}`;
    const text = `The event ${title} has been updated.\n\nStart Date: ${formatDate(startDate)}\nLocation: ${location || 'TBD'}`;
    const html = loadHtmlTemplate('event-updated.html', {
        title,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        description: event.description,
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

// Function for sending event request accepted email
export const sendEventRequestAcceptedEmail = async (
    to: string | string[],
    event: EventInterface,
    eventLink: string = 'https://example.com/event-details',
): Promise<nodemailer.SentMessageInfo> => {
    const { title, description, type, startDate, endDate, location } = event;

    const subject = `Event Request Approved: ${title}`;
    const text = `Your request to participate in ${title} has been approved!\n\nType: ${type}\nStart: ${formatDate(startDate)} ${event.startTime || ''}\nEnd: ${formatDate(endDate)} ${event.endTime || ''}\nLocation: ${location || 'TBD'}\nDescription: ${description}\nAccess event details at: ${eventLink}`;

    const html = loadHtmlTemplate('event-request-accepted.html', {
        title,
        type,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        location: location || 'To Be Determined',
        description,
        eventLink,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};

// Function for sending event request denied email
export const sendEventRequestDeniedEmail = async (
    to: string | string[],
    event: EventInterface,
    eventsLink: string = 'https://example.com/events',
): Promise<nodemailer.SentMessageInfo> => {
    const { title, description, type, startDate, endDate, location } = event;

    const subject = `Event Request Denied: ${title}`;
    const text = `We regret to inform you that your request to participate in ${title} has not been approved.\n\nType: ${type}\nStart: ${formatDate(startDate)} ${event.startTime || ''}\nEnd: ${formatDate(endDate)} ${event.endTime || ''}\nLocation: ${location || 'TBD'}\nDescription: ${description}\nBrowse other events at: ${eventsLink}`;

    const html = loadHtmlTemplate('event-request-denied.html', {
        title,
        type,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        location: location || 'To Be Determined',
        description,
        eventsLink,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};
