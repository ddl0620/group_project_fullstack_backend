import { RSVPInterface, RSVPStatus } from '../interfaces/Invitation/rsvp.interface';
import { InvitationInterface } from '../interfaces/Invitation/invitation.interface';

/**
 * Create Invitation Input Type
 * 
 * Represents the data required to create a new invitation to an event.
 * This type defines the structure for sending invitations to users.
 */
export type CreateInvitationInput = {
    content?: string;
    eventId: string;
    inviteeId: string;
};

/**
 * Create RSVP Input Type
 * 
 * Represents the data required to respond to an event invitation.
 * This type defines the structure for submitting an RSVP response.
 */
export type CreateRSVPInput = {
    response: RSVPStatus;
};

/**
 * Invitation List Response Type
 * 
 * Represents the response structure when retrieving a list of invitations.
 * Includes both the invitation data and pagination information.
 */
export type InvitationListResponse = {
    invitations: InvitationInterface[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
};

/**
 * RSVP List Response Type
 * 
 * Represents the response structure when retrieving a list of RSVPs.
 * Includes both the RSVP data and pagination information.
 */
export type RSVPListResponse = {
    rsvps: RSVPInterface[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalRSVP: number;
    };
};
