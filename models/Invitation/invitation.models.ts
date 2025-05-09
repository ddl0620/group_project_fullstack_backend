import mongoose, { Schema } from 'mongoose';
import {InvitationInterface} from "../../interfaces/Invitation/invitation.interface";

/**
 * Mongoose schema for event invitations.
 * 
 * This schema defines the structure for invitation documents in MongoDB,
 * representing invitations sent from one user to another for a specific event.
 */
const invitationSchema = new Schema<InvitationInterface>(
    {
        sentAt: { type: Date, required: true, default: Date.now },
        content: { type: String },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        inviteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        invitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        isDeleted: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

/**
 * Mongoose model for invitation documents.
 * 
 * This model provides an interface for creating, querying, updating, and
 * deleting invitation documents in the MongoDB 'Invitation' collection.
 */
export const InvitationModel = mongoose.model<InvitationInterface>('Invitation', invitationSchema);