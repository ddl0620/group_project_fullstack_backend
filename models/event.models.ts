import mongoose from "mongoose";
import { EventType } from '../enums/eventType.enums';
import { ParticipantSchema } from "./participant.models"; // Import the separated schema

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    type: { type: String, enum: Object.values(EventType), required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true, maxlength: 200 },
    images: { type: [String], required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    participants: { type: [ParticipantSchema], required: false }, // Use imported schema
    isPublic: { type: Boolean, default: false },
},
    {
        timestamps: true,
    });

export const EventModel = mongoose.model('Event', EventSchema);
