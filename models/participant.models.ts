import mongoose, {Schema} from "mongoose";
import { ParticipationStatus } from "../enums/participationStatus.enums";
import {ParticipantInterface} from "../interfaces/participant.interfaces";

const ParticipantSchema = new Schema<ParticipantInterface>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: String, enum: Object.values(ParticipationStatus), default: ParticipationStatus.PENDING },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: {type: Date },
    isDeleted: { type: Boolean, default: false },
});

export { ParticipantSchema };
