import { NextFunction, Request, Response } from 'express';
import { EventService } from '../../services/event.service';
import { HttpResponse } from '../../helpers/HttpResponse';
import { createEventAdminSchema, updateEventAdminSchema } from '../../validation/event.validation';
import { HttpError } from '../../helpers/httpsError.helpers';
import { AuthenticationRequest } from '../../interfaces/authenticationRequest.interface';
import { EventModel } from '../../models/event.models';
import { EventInterface } from '../../interfaces/event.interfaces';

/**
 * EventManagementController
 * 
 * This controller handles all event management operations including:
 * - Retrieving events (all events or by user)
 * - Creating new events
 * - Updating existing events
 * - Managing event active status
 */
export class EventManagementController {
    /**
     * Retrieves all events with pagination and sorting
     * 
     * @param request - Express Request object containing query parameters for pagination and sorting
     * @param response - Express Response object
     * @param nextFunction - Express NextFunction for error handling
     * 
     * @query {number} page - Page number for pagination (default: 1)
     * @query {number} limit - Number of events per page (default: 10)
     * @query {string} sortBy - Sort direction, 'asc' or 'desc' (default: 'desc')
     */
    static async getAllEvents(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            const page = parseInt(request.query.page as string) || 1;
            const limit = parseInt(request.query.limit as string) || 10;
            const sortBy = (request.query.sortBy as string) || 'desc';

            // Assuming you have a service to fetch events
            const result = await EventService.getAll(page, limit, sortBy);

            HttpResponse.sendYES(response, 200, 'Events fetched successfully', result);
        } catch (error) {
            nextFunction(error);
        }
    }

    /**
     * Creates a new event
     * 
     * @param request - Express Request object containing event data and files
     * @param response - Express Response object
     * @param nextFunction - Express NextFunction for error handling
     * 
     * @param {string} request.params.userId - ID of the user creating the event
     * @param {Express.Multer.File[]} request.files - Uploaded files (images) for the event
     * @param {object} request.body - Event data validated against createEventAdminSchema
     */
    static async createNewEvent(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            const { error } = createEventAdminSchema.validate(request.body);
            if (error) {
                new HttpError(error.details[0].message || 'Invalid input', 400, 'VALIDATION_ERROR');
            }
            const userId: string = request.params.userId;
            const files: Express.Multer.File[] = request.files as Express.Multer.File[];

            // Assuming you have a service to fetch events
            const result = await EventService.addEvent(userId, request.body, files);

            HttpResponse.sendYES(response, 200, 'Events created successfully', { event: result });
        } catch (error) {
            nextFunction(error);
        }
    }

    /**
     * Updates an existing event
     * 
     * @param request - AuthenticationRequest object containing event data and authenticated user
     * @param response - Express Response object
     * @param nextFunction - Express NextFunction for error handling
     * 
     * @param {string} request.params.eventId - ID of the event to update
     * @param {string} request.user?.userId - ID of the authenticated user
     * @param {Express.Multer.File[]} request.files - New uploaded files (images) for the event
     * @param {string[]} request.body.existingImages - Array of existing image paths to keep
     * @param {object} request.body - Updated event data validated against updateEventAdminSchema
     */
    static async updateEvent(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction,
    ) {
        try {
            const { error } = updateEventAdminSchema.validate(request.body);
            if (error) {
                new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const { existingImages } = request.body;

            const updatedEvent = await EventService.updateEvent(
                request.user?.userId as string,
                request.params.eventId,
                request.files as Express.Multer.File[],
                existingImages,
                request.body,
            );

            if (!updatedEvent) {
                throw new HttpError('Event not found', 404, 'EVENT_NOT_FOUND');
            }

            HttpResponse.sendYES(response, 200, 'Events fetched successfully', {
                event: updatedEvent,
            });
        } catch (error) {
            nextFunction(error);
        }
    }

    /**
     * Updates the active/deleted status of an event
     * 
     * @param request - AuthenticationRequest object containing event ID and status data
     * @param response - Express Response object
     * @param nextFunction - Express NextFunction for error handling
     * 
     * @param {string} request.params.eventId - ID of the event to update status
     * @param {boolean} request.body.isDeleted - New deleted status for the event
     */
    static async updateActiveStatus(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction,
    ) {
        try {
            const eventId: string = request.params.eventId;
            const { isDeleted } = request.body;
            const event: EventInterface = (await EventModel.findById(eventId)) as EventInterface;

            const updatedEvent = await EventService.setActiveStatus(
                event.organizer.toString() || '',
                eventId,
                isDeleted,
            );

            console.log(updatedEvent);

            HttpResponse.sendYES(response, 200, 'Event status updated successfully', {
                event: updatedEvent,
            });
        } catch (error) {
            nextFunction(error);
        }
    }

    /**
     * Retrieves all events associated with a specific user (both joined and organized)
     * 
     * @param request - Express Request object containing user ID and pagination parameters
     * @param response - Express Response object
     * @param nextFunction - Express NextFunction for error handling
     * 
     * @param {string} request.params.id - ID of the user whose events to retrieve
     * @param {number} request.query.page - Page number for pagination (default: 1)
     * @param {number} request.query.limit - Number of events per page (default: 10)
     * @param {string} request.query.sortBy - Sort direction, 'asc' or 'desc' (default: 'desc')
     */
    static async getAllEventByUserId(
        request: Request,
        response: Response,
        nextFunction: NextFunction,
    ) {
        try {
            const userId = request.params.id;
            const page = parseInt(request.query.page as string) || 1;
            const limit = parseInt(request.query.limit as string) || 10;
            const sortBy = (request.query.sortBy as string) || 'desc';

            // Assuming you have a service to fetch events
            const result = await EventService.getJoinedAndOrganizedEvents(
                userId,
                page,
                limit,
                sortBy,
            );

            HttpResponse.sendYES(response, 200, 'Events fetched successfully', result);
        } catch (error) {
            nextFunction(error);
        }
    }
}
