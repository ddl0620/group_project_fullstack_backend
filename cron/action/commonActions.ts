import { EventInterface } from '../../interfaces/event.interfaces';
import {
    sendEventDeletedEmail,
    sendEventNotificationEmail,
    sendEventUpdatedEmail,
    sendEventRequestAcceptedEmail,
    sendEventRequestDeniedEmail,
} from '../../email/email';
import { UserService } from '../../services/user.service';
import { ParticipationStatus } from '../../enums/participationStatus.enums';
import { UserInterface } from '../../interfaces/user.interfaces';

// Function to notify participants about an upcoming event
export const upcomingEventEmailAction = async (event: EventInterface) => {
    const participantEmails: string[] = [];
    for (const participant of event.participants || []) {
        if (participant.status !== ParticipationStatus.ACCEPTED) continue;

        const user: UserInterface = await UserService.getUserById(participant.userId.toString());
        participantEmails.push(user.email);
    }

    if (participantEmails.length === 0) {
        console.log('No participants to notify');
        return;
    }

    await sendEventNotificationEmail(participantEmails, event);
    console.log('Email upcoming sent successfully');
};

// Function to notify participants that an event has been updated
export const notifyEventUpdated = async (
    event: EventInterface,
    rsvpLink: string = 'https://example.com/event-details',
) => {
    const participantEmails: string[] = [];
    for (const participant of event.participants || []) {
        if (participant.status !== ParticipationStatus.ACCEPTED) continue;

        const user: UserInterface = await UserService.getUserById(participant.userId.toString());
        participantEmails.push(user.email);
    }

    if (participantEmails.length === 0) {
        console.log('No participants to notify');
        return;
    }

    await sendEventUpdatedEmail(participantEmails, event, rsvpLink);
    console.log('Email updated sent successfully');
};

// Function to notify participants that an event has been deleted
export const notifyEventDeleted = async (event: EventInterface) => {
    const participantEmails: string[] = [];
    for (const participant of event.participants || []) {
        if (participant.status !== ParticipationStatus.ACCEPTED) continue;

        const user: UserInterface = await UserService.getUserById(participant.userId.toString());
        participantEmails.push(user.email);
    }

    if (participantEmails.length > 0) {
        await sendEventDeletedEmail(participantEmails, event);
        console.log('Email deleted sent to participants');
    }
};

// Function to notify a user that their event participation request has been accepted
export const notifyEventRequestAccepted = async (
    userId: string,
    event: EventInterface,
    eventLink: string = 'https://example.com/event-details',
) => {
    const user: UserInterface = await UserService.getUserById(userId);
    if (!user) {
        console.log('User not found');
        return;
    }

    await sendEventRequestAcceptedEmail(user.email, event, eventLink);
    console.log(`Email request accepted sent to ${user.email}`);
};

// Function to notify a user that their event participation request has been denied
export const notifyEventRequestDenied = async (
    userId: string,
    event: EventInterface,
    eventsLink: string = 'https://example.com/events',
) => {
    const user: UserInterface = await UserService.getUserById(userId);
    if (!user) {
        console.log('User not found');
        return;
    }

    await sendEventRequestDeniedEmail(user.email, event, eventsLink);
    console.log(`Email request denied sent to ${user.email}`);
};
