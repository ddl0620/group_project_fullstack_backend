import { RSVPInterface, RSVPStatus } from '../interfaces/Invitation/rsvp.interface';
import { InvitationInterface } from '../interfaces/Invitation/invitation.interface';

export type CreateInvitationInput = {
    content?: string;
    eventId: string;
    inviteeId: string;
};

export type CreateRSVPInput = {
    response: RSVPStatus;
};

export type InvitationListResponse = {
    invitations: InvitationInterface[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
};

export type RSVPListResponse = {
    rsvps: RSVPInterface[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalRSVP: number;
    };
};
