import mongoose, { Document } from 'mongoose';

export enum RSVPStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DENIED = 'DENIED',
}

export interface RSVPInterface extends Document {
    invitation_id: mongoose.Schema.Types.ObjectId | string;
    response: RSVPStatus;
    responded_at?: Date;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}