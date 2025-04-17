import mongoose, { Document } from 'mongoose';

export interface InvitationInterface extends Document {
    sent_at: Date;
    content?: string;
    event_id: mongoose.Schema.Types.ObjectId | string;
    invitee_id: mongoose.Schema.Types.ObjectId | string;
    invitor_id: mongoose.Schema.Types.ObjectId | string;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}