import mongoose, { Schema } from 'mongoose';
import {RSVPInterface, RSVPStatus} from "../../interfaces/Invitation/rsvp.interface";

const rsvpSchema = new Schema<RSVPInterface>(
    {
        invitationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invitation', required: true },
        response: { type: String, enum: Object.values(RSVPStatus), required: true, default: RSVPStatus.PENDING },
        respondedAt: { type: Date },
        isDeleted: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

export const RSVPModel = mongoose.model<RSVPInterface>('RSVP', rsvpSchema);