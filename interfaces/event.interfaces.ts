import {Document} from "mongoose";
import {EventType} from "../enums/eventType.enums";
import {IParticipantStatus} from "./ParticipantStatus.interface";


export interface event extends Document {
    title: string;
    description: string;
    type: EventType;
    startDate: Date;
    endDate: Date;
    location?: Location;
    images?: string[];
    organizer: string;
    participants: IParticipantStatus;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;

}