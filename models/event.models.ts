import mongoose, { model, Schema } from "mongoose";
import { EventType } from "../enums/eventType.enums";
import { ParticipantSchema } from "./participant.models";
import { EventInterface } from "../interfaces/event.interfaces"; // Import the separated schema

const EventSchema = new Schema<EventInterface>(
    {
        title: { type: String, required: true, maxlength: 100 },
        description: { type: String, required: true, maxlength: 500 },
        type: { type: String, enum: Object.values(EventType), required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        location: { type: String, maxlength: 200, default: "" },
        images: { type: [String], default: [] },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        participants: { type: [ParticipantSchema], required: false }, // Use imported schema
        requestedUsers: { type: [ParticipantSchema], required: false },
        isPublic: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

EventSchema.path("endDate").validate(function (value) {
    return value > this.startDate;
}, "endDate must be after startDate");

export const EventModel = model<EventInterface>("Event", EventSchema);
