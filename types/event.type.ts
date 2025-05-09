// types/event.type.ts

import { EventInterface } from '../interfaces/event.interfaces';

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
    isOpen?: boolean;
};

// Định nghĩa kiểu dữ liệu cho dữ liệu cập nhật sự kiện
export type UpdateEventInput = Partial<CreateEventInput>;

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

export type RespondJoinInput = {
    userId: string;
    status: 'ACCEPTED' | 'DENIED';
}

export type UpdateIsOpenInput = {
    isOpen: boolean;
};
