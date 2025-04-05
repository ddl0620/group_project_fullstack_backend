import {Document} from "mongoose";
import {EventType} from "../enums/eventType.enums";
import {IParticipantStatus} from "./ParticipantStatus.interface";


export interface EventInterface extends Document {
    title: string;
    description: string;
    type: EventType;  // Assuming EventType is an enum
    startDate: Date;
    endDate: Date;
    location?: string;  // Location is a string (as per your schema), not a Location object
    images?: string[];  // Array of image URLs
    organizer: string;  // This is likely an ObjectId referencing the User model
    participants?: IParticipantStatus[];  // Array of participant statuses (corrected)
    isPublic: boolean;
    createdAt?: Date;  // Optional because Mongoose will automatically handle this
    updatedAt?: Date;  // Optional because Mongoose will automatically handle this
}