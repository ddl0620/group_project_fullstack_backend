import mongoose, { Document } from 'mongoose';

/**
 * Interface for Invitation document in MongoDB
 */
export interface InvitationInterface extends Document {
    /** Date when the invitation was sent */
    sentAt: Date;
    /** Optional content or message of the invitation (can be empty string) */
    content?: string;
    /** ID of the associated event */
    eventId: mongoose.Schema.Types.ObjectId | string;
    /** ID of the user who received the invitation */
    inviteeId: mongoose.Schema.Types.ObjectId | string;
    /** ID of the user who sent the invitation */
    invitorId: mongoose.Schema.Types.ObjectId | string;
    /** Soft delete flag */
    isDeleted: boolean;
    /** Creation timestamp */
    createdAt?: Date;
    /** Last update timestamp */
    updatedAt?: Date;
}