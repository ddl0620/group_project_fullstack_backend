import { EventInterface } from '../../interfaces/event.interfaces';
import {
    sendEventDeletedEmail,
    sendEventNotificationEmail,
    sendEventUpdatedEmail,
} from '../../email/email';
import { UserService } from '../../services/user.service';
import { ParticipationStatus } from '../../enums/participationStatus.enums';
import { UserInterface } from '../../interfaces/user.interfaces';

export const upcommingEventEmail = async (event: EventInterface) => {
    const participantEmails: string[] = [];
    for (const participant of event.participants || []) {
        if (participant.status !== ParticipationStatus.ACCEPTED) continue;

        const user: UserInterface = await UserService.getUserById(participant.userId.toString());
        participantEmails.push(user.email);
    }
    await sendEventNotificationEmail(participantEmails, event);
};

export const notifyEventUpdated = async (event: EventInterface) => {
    const participantEmails: string[] = [];
    for (const participant of event.participants || []) {
        if (participant.status !== ParticipationStatus.ACCEPTED) continue;

        const user: UserInterface = await UserService.getUserById(participant.userId.toString());
        participantEmails.push(user.email);
    }

    if (participantEmails.length > 0) {
        await sendEventUpdatedEmail(participantEmails, event);
        console.log('Email sent updated successfully');
    }
};

// Function to notify users that an event has been deleted
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
