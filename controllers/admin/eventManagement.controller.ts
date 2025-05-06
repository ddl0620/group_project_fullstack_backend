import { NextFunction, Request, Response } from 'express';
import { EventService } from '../../services/event.service';
import { HttpResponse } from '../../helpers/HttpResponse';
import { createEventAdminSchema, updateEventAdminSchema } from '../../validation/event.validation';
import { HttpError } from '../../helpers/httpsError.helpers';
import { AuthenticationRequest } from '../../interfaces/authenticationRequest.interface';
import { EventModel } from '../../models/event.models';
import { EventInterface } from '../../interfaces/event.interfaces';

export class EventManagementController {
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
