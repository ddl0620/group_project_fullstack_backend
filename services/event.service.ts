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
import { convertToCronSchedule } from '../helpers/convertToCronSchedule';
import { CronManager } from '../cron/cronManager';
import {
    notifyEventDeleted,
    notifyEventRequestAccepted,
    notifyEventRequestDenied,
    notifyEventUpdated,
    upcomingEventEmailAction,
} from '../cron/action/commonActions';
import { as } from '@faker-js/faker/dist/airline-BUL6NtOJ';
import CronScheduleBuilder from '../helpers/CronScheduleBuilder';

/**
 * Event Service
 *
 * This service manages operations related to events, including creation,
 * retrieval, updates, participation management, and event visibility.
 * It handles complex business logic for event participation, permissions,
 * and notification delivery.
 */
export class EventService {
    /**
     * Creates a new event
     *
     * Creates an event with the specified user as organizer, handling image uploads
     * and enforcing user event creation limits.
     *
     * @param {string} userId - ID of the user creating the event (organizer)
     * @param {CreateEventInput} eventData - Event details
     * @param {Express.Multer.File[] | undefined | null} files - Image files to upload
     * @returns {Promise<EventInterface>} The created event
     * @throws {HttpError} If user not found or event creation limit reached
     */

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
            const event: EventInterface | null = await EventModel.create({
                ...eventData,
                organizer: userId,
                participants: [],
                images: imgUrls,
            });

            if (!event) {
                throw new HttpError(
                    'Failed to create event',
                    StatusCode.INTERNAL_SERVER_ERROR,
                    ErrorCode.CAN_NOT_CREATE,
                );
            }

            // Set up cron job for event notification
            const schedule: string = convertToCronSchedule(
                event.startDate,
                event.startTime,
                event.notifyWhen,
            );
            console.log('schedule: ', schedule);
            await CronManager.getInstance().registerJob(
                `event-${event._id}`,
                schedule,
                upcomingEventEmailAction,
                { timezone: 'Asia/Ho_Chi_Minh' },
                event,
            );

            return event;
        } catch (err) {
            throw new HttpError(
                'Failed to create event',
                StatusCode.NOT_FOUND,
                ErrorCode.EVENT_NOT_FOUND,
            );
        }
    }

    /**
     * Retrieves events organized by a specific user
     *
     * Gets events where the specified user is the organizer, with pagination
     * and sorting options.
     *
     * @param {string} userId - ID of the organizer
     * @param {number} page - Page number for pagination (default: 1)
     * @param {number} limit - Number of events per page (default: 10)
     * @param {string} sortBy - Sort order ('asc' or 'desc', default: 'desc')
     * @returns {Promise<EventListResponse>} Events and pagination information
     */
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

    /**
     * Retrieves all events visible to a specific user
     *
     * Gets events that are public, or where the user is an organizer or participant,
     * with pagination and sorting options.
     *
     * @param {string} userId - ID of the user
     * @param {number} page - Page number for pagination (default: 1)
     * @param {number} limit - Number of events per page (default: 10)
     * @param {string} sortBy - Sort order ('asc' or 'desc', default: 'desc')
     * @returns {Promise<EventListResponse>} Events and pagination information
     */
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

    /**
     * Retrieves events where user is either organizer or participant
     *
     * Gets events where the specified user is either the organizer or a participant,
     * with pagination and sorting options.
     *
     * @param {string} userId - ID of the user
     * @param {number} page - Page number for pagination (default: 1)
     * @param {number} limit - Number of events per page (default: 10)
     * @param {string} sortBy - Sort order ('asc' or 'desc', default: 'desc')
     * @returns {Promise<EventListResponse>} Events and pagination information
     */
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

    /**
     * Retrieves all events with pagination
     *
     * Gets all events in the system with pagination and sorting options.
     *
     * @param {number} page - Page number for pagination (default: 1)
     * @param {number} limit - Number of events per page (default: 10)
     * @param {string} sortBy - Sort order ('asc' or 'desc', default: 'desc')
     * @returns {Promise<EventListResponse>} Events and pagination information
     */
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

    /**
     * Retrieves events where user is a participant
     *
     * Gets events where the specified user is a participant (not organizer),
     * with pagination and sorting options.
     *
     * @param {string} userId - ID of the user
     * @param {number} page - Page number for pagination (default: 1)
     * @param {number} limit - Number of events per page (default: 10)
     * @param {string} sortBy - Sort order ('asc' or 'desc', default: 'desc')
     * @returns {Promise<EventListResponse>} Events and pagination information
     */
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

    /**
     * Retrieves a specific event by ID with access control
     *
     * Gets an event by ID, enforcing access control for private events.
     *
     * @param {string} userId - ID of the user requesting access
     * @param {string} eventId - ID of the event to retrieve
     * @returns {Promise<EventInterface>} The event object
     * @throws {HttpError} If event not found or user has no access to private event
     */
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

    /**
     * Updates an existing event
     *
     * Updates event details, managing associated images and notifying participants.
     *
     * @param {string} userId - ID of the user attempting the update
     * @param {string} eventId - ID of the event to update
     * @param {Express.Multer.File[]} files - New image files to upload
     * @param {string[]} existingImages - URLs of images to keep
     * @param {UpdateEventInput} updateData - New event data
     * @returns {Promise<EventInterface>} The updated event
     * @throws {HttpError} If event not found or user not authorized
     */
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

        await notifyEventUpdated(updatedEvent);

        const schedule: string = convertToCronSchedule(
            updatedEvent.startDate,
            updatedEvent.startTime,
            updatedEvent.notifyWhen,
        );
        console.log('schedule: ', schedule);
        CronManager.getInstance().registerJob(
            `event-${updatedEvent._id}`,
            schedule,
            upcomingEventEmailAction,
            { timezone: 'Asia/Ho_Chi_Minh' },
            updatedEvent,
        );

        return updatedEvent;
    }

    /**
     * Sets the active/deleted status of an event
     *
     * Marks an event as deleted or active, with notification to participants.
     *
     * @param {string} userId - ID of the user attempting the status change
     * @param {string} eventId - ID of the event to update
     * @param {boolean} isActive - Whether the event should be marked as deleted (false) or active (true)
     * @returns {Promise<EventInterface>} The updated event
     * @throws {HttpError} If event not found or user not authorized
     */
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

        if (deletedEvent.isDeleted) {
            await notifyEventDeleted(deletedEvent);
        }

        return deletedEvent;
    }

    /**
     * Processes a user's request to join an event
     *
     * Handles join requests with different flows for public vs. private events,
     * enforcing participant limits and preventing duplicate joins.
     *
     * @param {string} userId - ID of the user requesting to join
     * @param {string} eventId - ID of the event to join
     * @returns {Promise<EventInterface>} The updated event
     * @throws {HttpError} If event not found, user already joined, or participant limit reached
     */
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

    /**
     * Processes an organizer's response to a join request
     *
     * Handles acceptance or rejection of pending join requests,
     * enforcing participant limits and sending appropriate notifications.
     *
     * @param {string} eventId - ID of the event
     * @param {string} userIdToken - ID of the organizer responding to the request
     * @param {RespondJoinInput} input - Response data including userId and status
     * @returns {Promise<EventInterface>} The updated event
     * @throws {HttpError} If event not found, user not authorized, or participant limit reached
     */
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

        if (input.status === 'ACCEPTED')
            await notifyEventRequestAccepted(input.userId, updatedEvent);
        else await notifyEventRequestDenied(input.userId, updatedEvent);

        return updatedEvent;
    }

    // HERE : Update the isOpen field of the event
    static async updateIsOpen(
        eventId: string,
        userId: string,
        isOpen: boolean,
    ): Promise<EventInterface> {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new HttpError(
                'Invalid event ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        const event = await EventModel.findOne({ _id: eventId, isDeleted: false });
        if (!event) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        if (event.organizer.toString() !== userId) {
            throw new HttpError(
                'Only the organizer can update the event status',
                StatusCode.FORBIDDEN,
                ErrorCode.UNAUTHORIZED,
            );
        }

        const updatedEvent = await EventModel.findByIdAndUpdate(
            eventId,
            { $set: { isOpen } },
            { new: true, runValidators: true },
        );

        if (!updatedEvent) {
            throw new HttpError('Event not found', StatusCode.NOT_FOUND, ErrorCode.EVENT_NOT_FOUND);
        }

        return updatedEvent;
    }
}
