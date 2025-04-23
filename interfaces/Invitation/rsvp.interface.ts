import mongoose, { Document } from 'mongoose';

/**
 * Enum for RSVP response status
 */
export enum RSVPStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DENIED = 'DENIED',
}

/**
 * Interface for RSVP document in MongoDB
 */
export interface RSVPInterface extends Document {
    /** ID of the associated invitation */
    invitationId: mongoose.Schema.Types.ObjectId | string;
    /** Response status (PENDING, ACCEPTED, DENIED) */
    response: RSVPStatus;
    /** Date when the RSVP was responded */
    respondedAt: Date;
    /** Soft delete flag */
    isDeleted: boolean;
    /** Creation timestamp */
    createdAt?: Date;
    /** Last update timestamp */
    updatedAt?: Date;
}