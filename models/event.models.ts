import mongoose, { model, Schema } from 'mongoose';
import { EventType } from '../enums/eventType.enums';
import { ParticipantSchema } from './participant.models';
import { EventInterface } from '../interfaces/event.interfaces';
import { NOTIFY_WHEN } from '../enums/notifyWhen.enums'; // Import the separated schema

/**
 * Mongoose schema for events.
 *
 * This schema defines the structure for event documents in MongoDB,
 * representing organized activities with details like timing, location,
 * participants, and visibility settings.
 */
const EventSchema = new Schema<EventInterface>(
    {
        title: { type: String, required: true, maxlength: 100 },
        description: { type: String, required: true, maxlength: 500 },
        type: { type: String, enum: Object.values(EventType), required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        startTime: {
            type: String,
            required: true,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            default: '00:00',
        },
        endTime: {
            type: String,
            required: true,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            default: '23:59',
        },
        notifyWhen: {
            type: String,
            enum: Object.values(NOTIFY_WHEN),
            default: NOTIFY_WHEN.ONE_DAY_BEFORE,
            required: true,
        },
        location: { type: String, maxlength: 200 },
        images: { type: [String], default: [] },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        participants: { type: [ParticipantSchema], required: false }, // Use imported schema
        isPublic: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        isOpen: { type: Boolean, default: true }, // Add this field
    },
    {
        timestamps: true,
    },
);

/**
 * Validation to ensure endDate is after startDate (currently commented out)
 * When uncommented, this validation prevents saving events with invalid date ranges
 */

/**
 * Mongoose model for event documents.
 *
 * This model provides an interface for creating, querying, updating, and
 * deleting event documents in the MongoDB 'Event' collection.
 */
export const EventModel = model<EventInterface>('Event', EventSchema);
