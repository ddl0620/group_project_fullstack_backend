import mongoose, {Schema} from "mongoose";
import { ParticipationStatus } from "../enums/participationStatus.enums";
import {IParticipantStatus} from "../interfaces/participant.interfaces";

const ParticipantSchema = new Schema<IParticipantStatus>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: String, enum: Object.values(ParticipationStatus), default: ParticipationStatus.PENDING },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: {type: Date },
});

export { ParticipantSchema };
