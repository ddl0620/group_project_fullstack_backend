import mongoose from 'mongoose';
import { EventModel } from '../models/event.models';
import { UserModel } from '../models/user.models';
import { HttpError } from '../helpers/httpsError.helpers';
import { EventInterface } from '../interfaces/event.interfaces';
import {
    CreateEventInput,
    EventListResponse,
    RespondJoinInput,
    UpdateEventInput,
} from '../types/event.type';
import { ParticipationStatus } from '../enums/participationStatus.enums';
import { ParticipantInterface } from '../interfaces/participant.interfaces';
import { ImageUploadService, UploadImageInput } from './imageUpload.service';
import { updateEventSchema } from '../validation/event.validation';

export class EventService {
    static async addEvent(
        userId: string,
        eventData: CreateEventInput,
        files: Express.Multer.File[],
    ): Promise<EventInterface> {
        const user = await UserModel.findById(userId).select('-password');

        if (!user) {
            throw new HttpError('User not found', 404, 'USER_NOT_FOUND');
        }

        const imgUrls = await ImageUploadService.convertFileToURL(files, 'event', userId);

        try {
            const newEvent = await EventModel.create({
                ...eventData,
                organizer: userId,
                participants: [],
                images: imgUrls,
            });
            return newEvent;
        } catch (err) {
            throw new HttpError('Failed to create event', 500, 'CREATE_EVENT_FAILED');
        }
    }

    static async getMyEvents(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<EventListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [
                { $or: [{ organizer: userId }] },
                { isDeleted: false }, // Loại bỏ sự kiện đã bị xóa
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

    static async getAllEvents(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<EventListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [
                {
                    $or: [
                        { isPublic: false },
                        { isPublic: true },
                        { organizer: userId },
                        { 'participants.userId': userId },
                    ],
                },
                { isDeleted: false }, // Loại bỏ sự kiện đã bị xóa
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

    static async getJoinedEvent(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<EventListResponse> {
        const skip = (page - 1) * limit;
        const sortOrder = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [
                {
                    $or: [{ 'participants.userId': userId }],
                },
                { isDeleted: false }, // Loại bỏ sự kiện đã bị xóa
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

    static async getEventById(userId: string, eventId: string): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false }); // Loại bỏ sự kiện đã bị xóa
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (!event.isPublic) {
            const isOrganizer = event.organizer?.toString() === userId;
            const isParticipant =
                event.participants?.some(
                    participant => participant.userId?.toString() === userId,
                ) || false;

            if (!isOrganizer && !isParticipant) {
                throw new HttpError('Access denied to private event', 403, 'ACCESS_DENIED');
            }
        }

        return event;
    }

    static async updateEvent(
        userId: string,
        eventId: string,
        files: Express.Multer.File[],
        existingImages: string[],
        updateData: UpdateEventInput,
    ): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false }); // Loại bỏ sự kiện đã bị xóa
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (!event.organizer || event.organizer.toString() !== userId) {
            throw new HttpError('Only the organizer can update this event', 403, 'FORBIDDEN');
        }

        const images = await ImageUploadService.updateImagesList(
            files,
            existingImages,
            event,
            'event',
            eventId,
        );

        updateData.images = images;

        const updatedEvent = await EventModel.findByIdAndUpdate(
            eventId,
            { $set: updateData },
            { new: true, runValidators: true },
        );

        if (!updatedEvent) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        return updatedEvent;
    }

    static async deleteEvent(userId: string, eventId: string): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false }); // Loại bỏ sự kiện đã bị xóa
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (!event.organizer || event.organizer.toString() !== userId) {
            throw new HttpError('Only the organizer can delete this event', 403, 'FORBIDDEN');
        }

        // Soft delete: Đánh dấu isDeleted = true
        const deletedEvent = await EventModel.findByIdAndUpdate(
            eventId,
            { $set: { isDeleted: true } },
            { new: true },
        );

        if (!deletedEvent) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        return deletedEvent;
    }

    static async joinEvent(userId: string, eventId: string): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false }); // Loại bỏ sự kiện đã bị xóa
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError('User not found', 404, 'NOT_FOUND_USER');
        }

        const isJoined = event.participants?.some(
            participant => participant.userId?.toString() === userId,
        );

        const isOrganizer = event.organizer?.toString() === userId;

        if (isJoined) {
            throw new HttpError(
                'User already joined or sent request to the event',
                400,
                'USER_ALREADY_JOINED',
            );
        }

        if (isOrganizer) {
            throw new HttpError(
                'Organizer cannot join their own event',
                400,
                'ORGANIZER_CANNOT_JOIN',
            );
        }
        const status = event.isPublic ? ParticipationStatus.ACCEPTED : ParticipationStatus.PENDING;
        const newParticipant: ParticipantInterface = {
            userId: new mongoose.Types.ObjectId(userId),
            status,
            invitedAt: new Date(),
            respondedAt: event.isPublic ? new Date() : null,
        } as ParticipantInterface;

        const updatedEvent = await EventModel.findByIdAndUpdate(
            eventId,
            {
                $push: { participants: newParticipant },
            },
            { new: true },
        );

        if (!updatedEvent) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        return updatedEvent;
    }

    static async replyEvent(
        eventId: string,
        userIdToken: string,
        input: RespondJoinInput,
    ): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        if (!mongoose.Types.ObjectId.isValid(input.userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false }); // Loại bỏ sự kiện đã bị xóa
        if (!event) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        if (userIdToken !== event.organizer.toString()) {
            throw new HttpError('Only the organizer can respond to this event', 403, 'FORBIDDEN');
        }

        const participant = event.participants?.find(p => p.userId?.toString() === input.userId);

        if (!participant) {
            throw new HttpError('Participant not found', 404, 'NOT_FOUND_PARTICIPANT');
        }

        if (participant.status !== ParticipationStatus.PENDING) {
            throw new HttpError('Participant already replied', 400, 'PARTICIPANT_ALREADY_REPLIED');
        }

        const updatedEvent = await EventModel.findOneAndUpdate(
            { _id: eventId, 'participants.userId': input.userId },
            {
                $set: {
                    'participants.$.status':
                        input.status === 'ACCEPTED'
                            ? ParticipationStatus.ACCEPTED
                            : ParticipationStatus.DENIED,
                    'participants.$.respondedAt': new Date(),
                },
            },
            { new: true },
        );

        if (!updatedEvent) {
            throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
        }

        return updatedEvent;
    }
}
