import mongoose from "mongoose";
import { ParticipationStatus } from "../enums/participationStatus.enums";

const ParticipantSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    status: { type: String, enum: Object.values(ParticipationStatus), default: 'PENDING' },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: Date
});

export { ParticipantSchema };
