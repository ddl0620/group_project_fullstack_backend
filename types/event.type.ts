// types/event.type.ts

import { EventInterface } from '../interfaces/event.interfaces';

/**
 * Create Event Input Type
 * 
 * Represents the data required to create a new event.
 * This type defines the structure for submitting new events in the system.
 */
// Định nghĩa kiểu dữ liệu cho dữ liệu tạo sự kiện
export type CreateEventInput = {
    title: string;
    description: string;
    type: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    images?: string[];
    participants?: { userId: string; status: string }[];
    isPublic: boolean;
    organizer: string;
};

/**
 * Update Event Input Type
 * 
 * Represents the data that can be updated for an existing event.
 * All fields are optional, allowing partial updates to event information.
 */
// Định nghĩa kiểu dữ liệu cho dữ liệu cập nhật sự kiện
export type UpdateEventInput = Partial<CreateEventInput>;

/**
 * Event List Response Type
 * 
 * Represents the response structure when retrieving a list of events.
 * Includes both the event data and pagination information for navigating large result sets.
 */
// Định nghĩa kiểu dữ liệu cho phản hồi của getEvents/getMyEvents
export type EventListResponse = {
    events: EventInterface[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalEvents: number;
    };
};

/**
 * Respond to Join Request Input Type
 * 
 * Represents the data required to respond to an event participation request.
 * Used when accepting or denying a user's request to join an event.
 */
export type RespondJoinInput = {
    userId: string;
    status: 'ACCEPTED' | 'DENIED';
}
