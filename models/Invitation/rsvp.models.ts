import mongoose, { Schema } from 'mongoose';
import {RSVPInterface, RSVPStatus} from "../../interfaces/Invitation/rsvp.interface";

/**
 * Mongoose schema for event RSVPs (Répondez s'il vous plaît).
 * 
 * This schema defines the structure for RSVP documents in MongoDB,
 * representing responses to event invitations. It tracks whether an invitee
 * has accepted, declined, or has not yet responded to an invitation.
 */
const rsvpSchema = new Schema<RSVPInterface>(
    {
        invitationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invitation', required: true },
        response: { type: String, enum: Object.values(RSVPStatus), required: true, default: RSVPStatus.PENDING },
        respondedAt: { type: Date },
        isDeleted: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

/**
 * Mongoose model for RSVP documents.
 * 
 * This model provides an interface for creating, querying, updating, and
 * deleting RSVP documents in the MongoDB 'RSVP' collection.
 */
export const RSVPModel = mongoose.model<RSVPInterface>('RSVP', rsvpSchema);