import mongoose, { Schema } from 'mongoose';
import {InvitationInterface} from "../../interfaces/Invitation/invitation.interface";

const invitationSchema = new Schema<InvitationInterface>(
    {
        sent_at: { type: Date, required: true, default: Date.now },
        content: { type: String },
        event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        invitee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        invitor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isDeleted: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

export const InvitationModel = mongoose.model<InvitationInterface>('Invitation', invitationSchema);