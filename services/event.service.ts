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
import { ImageUploadService } from './imageUpload.service';
import { NotificationService } from './notification.service';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';
import { UserInterface } from '../interfaces/user.interfaces';

export class EventService {
    static async addEvent(
        userId: string,
        eventData: CreateEventInput,
        files: Express.Multer.File[] | undefined | null,
    ): Promise<EventInterface> {
        const user: Partial<UserInterface> | null =
            await UserModel.findById(userId).select('-password');

        if (!user) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        const userEventCount = await EventModel.countDocuments({
            organizer: userId,
            isDeleted: false,
        });

        if (user.maxEventCreate !== undefined && userEventCount >= user.maxEventCreate) {
            throw new HttpError(
                `You have reached your limit of ${user.maxEventCreate} events. You cannot create more events.`,
                StatusCode.FORBIDDEN,
                ErrorCode.EVENT_EXCEEDED_LIMIT,
            );
        }

        let imgUrls: string[] = [];
        if (files && files.length > 0) {
            imgUrls = await ImageUploadService.convertFileToURL(files, 'event', userId);
        }

        try {
            return await EventModel.create({
                ...eventData,
                organizer: userId,
                participants: [],
                images: imgUrls,
            });
        } catch (err) {
            throw new HttpError(
                'Failed to create event',
                StatusCode.NOT_FOUND,
                ErrorCode.EVENT_NOT_FOUND,
            );
        }
    }

    static async getOrganizedEvents(
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

        const events: EventInterface[] | null = await EventModel.find(query)
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalEvents: number = await EventModel.countDocuments(query);

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

    //Note: Visible events: joined, organizer, or public, not deleted, private
    static async getAllVisibleEvent(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<EventListResponse> {
        const skip: number = (page - 1) * limit;
        const sortOrder: 1 | -1 = sortBy.toLowerCase() === 'asc' ? 1 : -1;

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
                { isDeleted: false },
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

    static async getJoinedAndOrganizedEvents(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<EventListResponse> {
        const skip: number = (page - 1) * limit;
        const sortOrder: 1 | -1 = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [
                {
                    $or: [{ organizer: userId }, { 'participants.userId': userId }],
                },
                { isDeleted: false }, // Loại bỏ sự kiện đã bị xóa
            ],
        };

        const events: EventInterface[] | null = await EventModel.find(query)
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

    static async getAll(
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'desc',
    ): Promise<EventListResponse> {
        const skip: number = (page - 1) * limit;
        const sortOrder: 1 | -1 = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const events: EventInterface[] | null = await EventModel.find()
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalEvents: number = await EventModel.countDocuments();

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
        const skip: number = (page - 1) * limit;
        const sortOrder: 1 | -1 = sortBy.toLowerCase() === 'asc' ? 1 : -1;

        const query = {
            $and: [
                {
                    $or: [{ 'participants.userId': userId }],
                },
                { isDeleted: false }, // Loại bỏ sự kiện đã bị xóa
            ],
        };

        const events: EventInterface[] | null = await EventModel.find(query)
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalEvents: number = await EventModel.countDocuments(query);

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
            throw new HttpError(
                'Invalid event ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        const event: EventInterface | null = await EventModel.findOne({
            _id: eventId,
            isDeleted: false,
        }); // Loại bỏ sự kiện đã bị xóa

        if (!event) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        if (!event.isPublic) {
            const isOrganizer: boolean = event.organizer?.toString() === userId;
            const isParticipant: boolean =
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
            throw new HttpError(
                'Invalid event ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        const event: EventInterface | null = await EventModel.findById(eventId); // Loại bỏ sự kiện đã bị xóa

        if (!event) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        if (updateData.organizer) {
            if (updateData.organizer !== event.organizer) {
                const newOrganizer: UserInterface | null = await UserModel.findOne({
                    _id: updateData.organizer,
                    isDeleted: false,
                });

                if (!newOrganizer) {
                    throw new HttpError(
                        'New organizer not found',
                        StatusCode.NOT_FOUND,
                        ErrorCode.USER_NOT_FOUND,
                    );
                }
            }
        } else if (!event.organizer || event.organizer.toString() !== userId) {
            throw new HttpError(
                'Only the organizer can update this event',
                StatusCode.FORBIDDEN,
                ErrorCode.UNAUTHORIZED,
            );
        }

        updateData.images = await ImageUploadService.updateImagesList(
            files,
            existingImages,
            event,
            'event',
            eventId,
        );

        const updatedEvent: EventInterface | null = await EventModel.findByIdAndUpdate(
            eventId,
            { $set: updateData },
            { new: true, runValidators: true },
        );

        if (!updatedEvent) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        const userIds: string[] = (updatedEvent.participants || []).map(participant =>
            participant.userId.toString(),
        );
        await NotificationService.createNotification({
            ...NotificationService.eventUpdateNotificationContent(updatedEvent.title),
            userIds,
        });
        return updatedEvent;
    }

    static async setActiveStatus(
        userId: string,
        eventId: string,
        isActive: boolean,
    ): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError(
                'Invalid event ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        const event: EventInterface | null = await EventModel.findById(eventId); // Loại bỏ sự kiện đã bị xóa
        if (!event) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        if (!event.organizer || event.organizer.toString() !== userId) {
            throw new HttpError('Only the organizer can delete this event', 403, 'FORBIDDEN');
        }

        const deletedEvent: EventInterface | null = await EventModel.findByIdAndUpdate(
            eventId,
            { $set: { isDeleted: isActive } },
            { new: true },
        );

        if (!deletedEvent) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        if (!isActive) {
            const userId: string[] = (deletedEvent.participants || []).map(participant =>
                participant.userId.toString(),
            );
            await NotificationService.createNotification({
                ...NotificationService.deleteEventNotificationContent(deletedEvent.title),
                userIds: userId,
            });
        }

        return deletedEvent;
    }

    static async joinEvent(userId: string, eventId: string): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError(
                'Invalid event ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(
                'Invalid user ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false }); // Loại bỏ sự kiện đã bị xóa
        if (!event) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }
        
        // HERE: Check if the event is open for joining
        if (!event.isOpen) {
            throw new HttpError('Event is closed', StatusCode.FORBIDDEN, ErrorCode.EVENT_CLOSED);
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError('User not found', StatusCode.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        const isJoined: boolean | undefined = event.participants?.some(
            participant => participant.userId?.toString() === userId,
        );

        const isOrganizer: boolean = event.organizer?.toString() === userId;

        if (isJoined) {
            throw new HttpError(
                'User already joined or sent request to the event',
                StatusCode.FORBIDDEN,
                ErrorCode.UNAUTHORIZED,
            );
        }

        if (isOrganizer) {
            throw new HttpError(
                'Organizer cannot join their own event',
                StatusCode.FORBIDDEN,
                ErrorCode.UNAUTHORIZED,
            );
        }

        if (event.isPublic) {
            const organizer: UserInterface | null = await UserModel.findById(event.organizer);
            if (!organizer) {
                throw new HttpError(
                    'Event organizer not found',
                    StatusCode.NOT_FOUND,
                    ErrorCode.USER_NOT_FOUND,
                );
            }

            // Count current accepted participants
            const acceptedParticipantsCount =
                event.participants?.filter(p => p.status === ParticipationStatus.ACCEPTED).length ||
                0;

            // Check if joining would exceed the limit
            if (
                organizer.maxParticipantPerEvent !== undefined &&
                acceptedParticipantsCount >= organizer.maxParticipantPerEvent
            ) {
                throw new HttpError(
                    `Event has reached the maximum limit of ${organizer.maxParticipantPerEvent} participants`,
                    StatusCode.FORBIDDEN,
                    ErrorCode.MAX_PARTICIPANT_EXCEEDED_LIMIT,
                );
            }
        }

        const status: Partial<ParticipationStatus> = event.isPublic
            ? ParticipationStatus.ACCEPTED
            : ParticipationStatus.PENDING;

        const newParticipant: Partial<ParticipantInterface> = {
            userId: new mongoose.Types.ObjectId(userId),
            status,
            invitedAt: new Date(),
            respondedAt: event.isPublic ? new Date() : null,
        };

        const updatedEvent: EventInterface | null = await EventModel.findByIdAndUpdate(
            eventId,
            {
                $push: { participants: newParticipant },
            },
            { new: true },
        );

        if (!updatedEvent) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        await NotificationService.createNotification({
            ...NotificationService.requestJoinNotificationContent(
                user.name || 'User',
                event.title || 'Event',
            ),
            userIds: [event.organizer?.toString() || ''],
        });

        return updatedEvent;
    }

    static async replyEvent(
        eventId: string,
        userIdToken: string,
        input: RespondJoinInput,
    ): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError(
                'Invalid event ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        if (!mongoose.Types.ObjectId.isValid(input.userId)) {
            throw new HttpError(
                'Invalid user ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        const event: EventInterface | null = await EventModel.findOne({
            _id: eventId,
            isDeleted: false,
        }); // Loại bỏ sự kiện đã bị xóa

        if (!event) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        if (userIdToken !== event.organizer.toString()) {
            throw new HttpError(
                'Only the organizer can respond to this event',
                StatusCode.FORBIDDEN,
                ErrorCode.UNAUTHORIZED,
            );
        }

        if (input.status === 'ACCEPTED') {
            const organizer: UserInterface | null = await UserModel.findById(userIdToken);
            if (!organizer) {
                throw new HttpError(
                    'Organizer not found',
                    StatusCode.NOT_FOUND,
                    ErrorCode.USER_NOT_FOUND,
                );
            }

            // Count current accepted participants
            const acceptedParticipantsCount: number =
                event.participants?.filter(p => p.status === ParticipationStatus.ACCEPTED).length ||
                0;

            // Check if accepting this participant would exceed the limit
            if (
                organizer.maxParticipantPerEvent !== undefined &&
                acceptedParticipantsCount >= organizer.maxParticipantPerEvent
            ) {
                throw new HttpError(
                    `Event has reached the maximum limit of ${organizer.maxParticipantPerEvent} participants`,
                    StatusCode.FORBIDDEN,
                    ErrorCode.MAX_PARTICIPANT_EXCEEDED_LIMIT,
                );
            }
        }

        const participant: ParticipantInterface | undefined = event.participants?.find(
            p => p.userId?.toString() === input.userId,
        );

        if (!participant) {
            throw new HttpError(
                'Participant not found',
                StatusCode.NOT_FOUND,
                ErrorCode.USER_NOT_FOUND,
            );
        }

        if (participant.status !== ParticipationStatus.PENDING) {
            throw new HttpError(
                'Participant already replied',
                StatusCode.FORBIDDEN,
                ErrorCode.FORBIDDEN,
            );
        }

        const updatedEvent: EventInterface | null = await EventModel.findOneAndUpdate(
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
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        const notiContent =
            input.status === 'ACCEPTED'
                ? NotificationService.requestAcceptNotificationContent(event.title)
                : NotificationService.requestDeniedNotificationContent(event.title);

        await NotificationService.createNotification({
            ...notiContent,
            userIds: [input.userId],
        });

        return updatedEvent;
    }

    // HERE : Update the isOpen field of the event
    static async updateIsOpen(eventId: string, isOpen: boolean): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new Error('Invalid event ID');
        }

        const event = await EventModel.findById(eventId);

        if (!event) {
            throw new Error('Event not found');
        }

        event.isOpen = isOpen;
        
        await event.save();

        return event;
    }
}
