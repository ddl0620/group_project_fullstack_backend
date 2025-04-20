import mongoose, { Schema } from 'mongoose';
import {InvitationInterface} from "../../interfaces/Invitation/invitation.interface";

const invitationSchema = new Schema<InvitationInterface>(
    {
        sentAt: { type: Date, required: true, default: Date.now },
        content: { type: String },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        inviteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        invitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isDeleted: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

export const InvitationModel = mongoose.model<InvitationInterface>('Invitation', invitationSchema);