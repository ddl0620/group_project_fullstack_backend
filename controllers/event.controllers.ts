import { NextFunction, Response } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { EventService } from '../services/event.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import {
    createEventSchema,
    joinEventSchema,
    updateEventSchema,
} from '../validation/event.validation';
import { validateInput } from '../helpers/validateInput';
import { StatusCode } from '../enums/statusCode.enums';
import { EventInterface } from '../interfaces/event.interfaces';
import { EventListResponse } from '../types/event.type';
import { ParticipationStatus } from '../enums/participationStatus.enums';

/**
 * EventController
 *
 * This controller handles all operations related to events, including:
 * - Creating new events with optional image attachments
 * - Retrieving events with various filters (my events, all events, joined events)
 * - Fetching individual events by ID
 * - Updating existing events (details and images)
 * - Soft deleting events
 * - Managing event participation (joining, responding to join requests)
 *
 * All endpoints require authentication through AuthenticationRequest.
 */
export class EventController {
    /**
     * Creates a new event
     *
     * This endpoint validates the event data, processes any attached images,
     * and creates a new event with the authenticated user as the organizer.
     *
     * @param req - AuthenticationRequest object containing authenticated user information and event data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.user.userId - ID of the authenticated user creating the event
     * @param {Object} req.body - Event details (title, description, date, etc.)
     * @param {Express.Multer.File[]} req.files - Array of uploaded image files
     * @returns {Promise<void>} - Returns the created event through HttpResponse
     */
    async addEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            validateInput(createEventSchema, req.body);

            const newEvent: EventInterface = await EventService.addEvent(
                req.user?.userId as string,
                {
                    ...req.body,
                    organizer: req.user?.userId,
                },
                req.files as Express.Multer.File[],
            );

            HttpResponse.sendYES(res, StatusCode.OK, 'Event added successfully', {
                event: newEvent,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves events organized by the authenticated user with pagination
     *
     * This endpoint fetches events where the authenticated user is the organizer,
     * supporting pagination and sorting options.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of events per page (default: 10)
     * @param {string} req.query.sortBy - Sorting direction (default: 'desc')
     * @returns {Promise<void>} - Returns paginated events through HttpResponse
     */
    async getMyEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result: EventListResponse = await EventService.getOrganizedEvents(
                req.user?.userId as string,
                page,
                limit,
                sortBy,
            );

            HttpResponse.sendYES(res, StatusCode.OK, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves all visible events with pagination
     *
     * This endpoint fetches all events that are visible to the authenticated user,
     * supporting pagination and sorting options.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of events per page (default: 10)
     * @param {string} req.query.sortBy - Sorting direction (default: 'desc')
     * @returns {Promise<void>} - Returns paginated events through HttpResponse
     */
    async getAllEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result: EventListResponse = await EventService.getAllVisibleEvent(
                req.user?.userId as string,
                page,
                limit,
                sortBy,
            );

            HttpResponse.sendYES(res, StatusCode.OK, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves events joined by the authenticated user with pagination
     *
     * This endpoint fetches events that the authenticated user has joined,
     * supporting pagination and sorting options.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of events per page (default: 10)
     * @param {string} req.query.sortBy - Sorting direction (default: 'desc')
     * @returns {Promise<void>} - Returns paginated events through HttpResponse
     */
    async getJoinedEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result: EventListResponse = await EventService.getJoinedEvent(
                req.user?.userId as string,
                page,
                limit,
                sortBy,
            );

            HttpResponse.sendYES(res, StatusCode.OK, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves a specific event by its ID
     *
     * This endpoint fetches a single event based on the provided event ID,
     * including all event details visible to the authenticated user.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.params.id - ID of the event to fetch
     * @returns {Promise<void>} - Returns the requested event through HttpResponse
     */
    async getEventById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const event: EventInterface = await EventService.getEventById(
                req.user?.userId as string,
                req.params.id,
            );

            HttpResponse.sendYES(res, StatusCode.OK, 'Event found successfully', { event });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Updates an existing event
     *
     * This endpoint validates the update data, processes any new or removed images,
     * and updates the specified event with the new details and images.
     * Only the event organizer can update the event.
     *
     * @param req - AuthenticationRequest object containing authenticated user information and update data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.params.id - ID of the event to update
     * @param {Object} req.body - Updated event details
     * @param {string[]} req.body.existingImages - Array of image IDs to retain
     * @param {Express.Multer.File[]} req.files - Array of new uploaded image files
     * @returns {Promise<void>} - Returns the updated event through HttpResponse
     */
    async updateEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            validateInput(updateEventSchema, req.body);

            const { existingImages } = req.body;
            const updatedEvent: EventInterface = await EventService.updateEvent(
                req.user?.userId as string,
                req.params.id,
                req.files as Express.Multer.File[],
                existingImages,
                req.body,
            );
            HttpResponse.sendYES(res, StatusCode.OK, 'Event updated successfully', {
                event: updatedEvent,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Soft deletes an event
     *
     * This endpoint marks an event as deleted (isDeleted: true) without permanently
     * removing it from the database. Only the event organizer can delete the event.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.params.id - ID of the event to delete
     * @returns {Promise<void>} - Returns confirmation of deletion through HttpResponse
     */
    async deleteEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const deletedEvent: EventInterface = await EventService.setActiveStatus(
                req.user?.userId as string,
                req.params.id,
                true,
            );

            HttpResponse.sendYES(res, StatusCode.OK, 'Event deleted successfully', {
                event: deletedEvent,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Allows a user to join an event or send a join request
     *
     * This endpoint processes a request to join an event. Depending on the event settings,
     * this may immediately add the user as a participant or create a pending join request.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.body.userId - ID of the user joining the event
     * @param {string} req.params.eventId - ID of the event to join
     * @returns {Promise<void>} - Returns the updated event through HttpResponse
     */
    async joinEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.body;
            const { eventId } = req.params;
            let { invited } = req.body;

            validateInput(joinEventSchema, req.body);

            const event: EventInterface = await EventService.joinEvent(
                userId,
                eventId,
                !invited ? ParticipationStatus.INVITED : null,
            );
            HttpResponse.sendYES(res, StatusCode.OK, 'Event joined/send request successfully', {
                event,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Responds to an event join request
     *
     * This endpoint allows the event organizer to approve or reject a user's request
     * to join an event.
     *
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     *
     * @param {string} req.body.userId - ID of the user whose request is being responded to
     * @param {string} req.body.status - Response status ('approved' or 'rejected')
     * @param {string} req.params.eventId - ID of the event
     * @returns {Promise<void>} - Returns the updated event through HttpResponse
     */
    async respondEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { userId, status } = req.body;
            const { eventId } = req.params;

            const event: EventInterface = await EventService.replyEvent(
                eventId,
                req.user?.userId as string,
                {
                    userId,
                    status,
                },
            );

            HttpResponse.sendYES(res, StatusCode.OK, 'Event responded successfully', { event });
        } catch (err) {
            next(err);
        }
    }

    async updateIsOpen(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { isOpen } = req.body;
            const { eventId } = req.params;

            const updatedEvent = await EventService.updateIsOpen(
                eventId,
                req.user?.userId as string,
                isOpen,
            );
            HttpResponse.sendYES(res, StatusCode.OK, 'Event status updated successfully', {
                event: updatedEvent,
            });
        } catch (err) {
            next(err);
        }
    }
}
