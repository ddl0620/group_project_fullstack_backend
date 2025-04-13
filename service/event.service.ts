import mongoose from 'mongoose';
import { EventModel } from '../models/event.models';
import { UserModel } from '../models/user.models';
import { HttpError } from '../helpers/httpsError.helpers';
import { EventInterface } from '../interfaces/event.interfaces';
import {
    CreateEventInput,
    UpdateEventInput,
    EventListResponse,
} from '../types/event.type';

export class EventService {
    // Thêm sự kiện mới
    static async addEvent(
        userId: string,
        eventData: CreateEventInput
    ): Promise<EventInterface> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Kiểm tra user tồn tại
            const user = await UserModel.findById(userId).select('-password');
            if (!user) {
                throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
            }

            const [newEvent] = await EventModel.create(
                [
                    {
                        ...eventData,
                    },
                ],
                { session }
            );

            await session.commitTransaction();
            return newEvent;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            await session.endSession();
        }
    }

    // Lấy danh sách sự kiện của người dùng hiện tại (my events)
    static async getMyEvents(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc'
    ): Promise<EventListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $or: [{ organizer: userId }],
        };

        const events = await EventModel.find(query)
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalEvents = await EventModel.countDocuments(query);

        return {
            events,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalEvents / limit),
                totalEvents,
            },
        };
    }

    // Lấy danh sách tất cả sự kiện (public, của người dùng, hoặc người dùng tham gia)
    static async getAllEvents(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc'
    ): Promise<EventListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $or: [
                { isPublic: true },
                { organizer: userId },
                { 'participants.userId': userId },
            ],
        };

        const events = await EventModel.find(query)
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalEvents = await EventModel.countDocuments(query);

        return {
            events,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalEvents / limit),
                totalEvents,
            },
        };
    }

    // Lấy chi tiết một sự kiện
    static async getEventById(
        userId: string,
        eventId: string
    ): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError(
                'Invalid event ID format',
                400,
                'INVALID_EVENT_ID'
            );
        }

        const event = await EventModel.findById(eventId);
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (!event.isPublic) {
            const isOrganizer =
                event.organizer && event.organizer.toString() === userId;
            const isParticipant =
                (event.participants &&
                    event.participants.some(
                        (participant) =>
                            participant.userId &&
                            participant.userId.toString() === userId
                    )) ||
                false;

            if (!isOrganizer && !isParticipant) {
                throw new HttpError(
                    'Access denied to private event',
                    403,
                    'ACCESS_DENIED'
                );
            }
        }

        return event;
    }

    // Cập nhật sự kiện
    static async updateEvent(
        userId: string,
        eventId: string,
        updateData: UpdateEventInput
    ): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError(
                'Invalid event ID format',
                400,
                'INVALID_EVENT_ID'
            );
        }

        const event = await EventModel.findById(eventId);
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (!event.organizer || event.organizer.toString() !== userId) {
            throw new HttpError(
                'Only the organizer can update this event',
                403,
                'FORBIDDEN'
            );
        }

        const updatedEvent = await EventModel.findByIdAndUpdate(
            eventId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedEvent) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        return updatedEvent;
    }

    // Xóa sự kiện
    static async deleteEvent(
        userId: string,
        eventId: string
    ): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError(
                'Invalid event ID format',
                400,
                'INVALID_EVENT_ID'
            );
        }

        const event = await EventModel.findById(eventId);
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (!event.organizer || event.organizer.toString() !== userId) {
            throw new HttpError(
                'Only the organizer can delete this event',
                403,
                'FORBIDDEN'
            );
        }

        const deletedEvent = await EventModel.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        return deletedEvent;
    }
}
