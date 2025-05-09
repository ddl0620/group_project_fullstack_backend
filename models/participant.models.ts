import mongoose, {Schema} from "mongoose";
import { ParticipationStatus } from "../enums/participationStatus.enums";
import {ParticipantInterface} from "../interfaces/participant.interfaces";

/**
 * Mongoose schema for event participants.
 * 
 * This schema defines the structure for participant documents embedded within event documents.
 * It tracks users invited to events and their response status, enabling event attendance management.
 * Note that this is a sub-schema intended to be embedded in other documents (likely Event documents)
 * rather than a standalone collection.
 */
const ParticipantSchema = new Schema<ParticipantInterface>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: String, enum: Object.values(ParticipationStatus), default: ParticipationStatus.PENDING },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: {type: Date },
    isDeleted: { type: Boolean, default: false },
});

export { ParticipantSchema };
