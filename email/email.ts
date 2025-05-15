import nodemailer from 'nodemailer';
import { EmailOptions, formatDate, loadHtmlTemplate, transporter } from './email.config';
import { EventInterface } from '../interfaces/event.interfaces';
import { HttpError } from '../helpers/httpsError.helpers';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';
import { FeedbackInterfaces } from '../interfaces/feedback/feedback.interfaces';

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

        return await transporter.sendMail(mailOptions);
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

    const subject = `Upcoming Event: ${title} (${type})`;
    const text = `Join us for ${title}!\n\nType: ${type}\nStart: ${formatDate(startDate)}\nEnd: ${formatDate(endDate)}\nLocation: ${location || 'TBD'}\nDescription: ${description}\nPublic: ${isPublic ? 'Yes' : 'No'}\n`;

    const html = loadHtmlTemplate('event-upcoming.html', {
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

// Function for sending event invitation email
export const sendEventInvitationEmail = async (
    to: string | string[],
    event: EventInterface,
    inviteeName: string,
    organizerName: string,
    rsvpLink: string = 'https://example.com/rsvp',
): Promise<nodemailer.SentMessageInfo> => {
    const { title, description, startDate, location } = event;

    const subject = `You're Invited to ${title}!`;
    const text = `Dear ${inviteeName},\n\nYou are invited to ${title}!\n\nStart: ${formatDate(startDate)}\nLocation: ${location || 'TBD'}\nDescription: ${description}\n\nRSVP at: ${rsvpLink}`;

    const html = loadHtmlTemplate('event-invitation.html', {
        eventTitle: title,
        eventDate: formatDate(startDate),
        eventLocation: location || 'To Be Determined',
        eventDescription: description,
        inviteeName,
        organizerName,
        rsvpLink,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};

// Function for sending event request accepted email to user
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

// Function for sending event request denied email to user
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

// Function for sending event join request email
export const sendEventJoinRequestEmail = async (
    to: string | string[],
    event: EventInterface,
    applicant: { name: string; email: string; message: string },
    organizerName: string,
    approvalLink: string = 'https://example.com/approve-request',
    rejectLink: string = 'https://example.com/reject-request',
    eventLink: string = 'https://example.com/event-details',
): Promise<nodemailer.SentMessageInfo> => {
    const { title, startDate, location } = event;

    const subject = `Join Event Request: ${title}`;
    const text = `Dear ${organizerName},\n\nYou have a new request from ${applicant.name} (${applicant.email}) to join your event "${title}".\n\nMessage: ${applicant.message}\nEvent Date: ${formatDate(startDate)}\nLocation: ${location || 'TBD'}\n\nApprove: ${approvalLink}\nReject: ${rejectLink}\nView Event: ${eventLink}`;

    const html = loadHtmlTemplate('event-join-request.html', {
        organizerName,
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        eventTitle: title,
        eventDate: formatDate(startDate),
        eventLocation: location || 'To Be Determined',
        requestMessage: applicant.message,
        approvalLink,
        rejectLink,
        eventLink,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};

// Function for sending event request accepted email to organizer
export const sendEventRequestAcceptedOrganizerEmail = async (
    to: string | string[],
    event: EventInterface,
    applicant: { name: string; email: string; message: string },
    organizerName: string,
    eventLink: string = 'https://example.com/event-details',
): Promise<nodemailer.SentMessageInfo> => {
    const { title, startDate, location } = event;

    const subject = `Event Request Accepted: ${title}`;
    const text = `Dear ${organizerName},\n\n${applicant.name} (${applicant.email}) has accepted the invitation to join your event "${title}".\n\nMessage: ${applicant.message}\nEvent Date: ${formatDate(startDate)}\nLocation: ${location || 'TBD'}\n\nView Event: ${eventLink}`;

    const html = loadHtmlTemplate('event-user-accepted.html', {
        organizerName,
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        eventTitle: title,
        eventDate: formatDate(startDate),
        eventLocation: location || 'To Be Determined',
        acceptMessage: applicant.message,
        eventLink,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};

// Function for sending event request declined email to organizer
export const sendEventRequestDeclinedEmail = async (
    to: string | string[],
    event: EventInterface,
    applicant: { name: string; email: string; message: string },
    organizerName: string,
    eventLink: string = 'https://example.com/event-details',
): Promise<nodemailer.SentMessageInfo> => {
    const { title, startDate, location } = event;

    const subject = `Event Request Declined: ${title}`;
    const text = `Dear ${organizerName},\n\n${applicant.name} (${applicant.email}) has declined the invitation to join your event "${title}".\n\nReason: ${applicant.message}\nEvent Date: ${formatDate(startDate)}\nLocation: ${location || 'TBD'}\n\nView Event: ${eventLink}`;

    const html = loadHtmlTemplate('event-user-denied.html', {
        organizerName,
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        eventTitle: title,
        eventDate: formatDate(startDate),
        eventLocation: location || 'To Be Determined',
        declineMessage: applicant.message,
        eventLink,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};

// Function for sending website feedback received email
export const sendWebsiteFeedbackReceivedEmail = async (
    to: string | string[],
    feedback: FeedbackInterfaces,
    adminDashboardLink: string = 'https://example.com/admin-dashboard',
): Promise<nodemailer.SentMessageInfo> => {
    const subject = 'New Website Feedback Received';
    const text = `Dear Administrator,\n\nYou have received new feedback from ${feedback.name} (${feedback.email})`;

    const html = loadHtmlTemplate('website-feedback-received.html', {
        feedbackName: feedback.name,
        feedbackEmail: feedback.email,
        feedbackRole: feedback.role,
        feedbackUniversity: feedback.university,
        feedbackRatingOverall: feedback.rating.overall.toString(),
        feedbackRatingUI: feedback.rating.ui.toString(),
        feedbackRatingUX: feedback.rating.ux.toString(),
        feedbackMessage: feedback.feedback,
        feedbackDate: formatDate(feedback.createdAt),
        adminDashboardLink,
        year: new Date().getFullYear().toString(),
        email: process.env.EMAIL_USER as string,
    });

    return sendEmail({ to, subject, text, html });
};
