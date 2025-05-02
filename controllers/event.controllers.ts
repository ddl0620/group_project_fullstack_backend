import { NextFunction, Response } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { EventService } from '../services/event.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { createEventSchema, updateEventSchema } from '../validation/event.validation';
import { HttpError } from '../helpers/httpsError.helpers';
import { NotificationService } from '../services/notification.service';
import { NotificationType } from '../enums/notificationType.enums';

export class EventController {
    async addEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log(req.body);
            const { error } = createEventSchema.validate(req.body);
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const newEvent = await EventService.addEvent(
                req.user?.userId as string,
                {
                    ...req.body,
                    organizer: req.user?.userId,
                },
                req.files as Express.Multer.File[],
            );

            HttpResponse.sendYES(res, 201, 'Event added successfully', { event: newEvent });
        } catch (err) {
            next(err);
        }
    }

    async getMyEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await EventService.getOrganizedEvents(
                req.user?.userId as string,
                page,
                limit,
                sortBy,
            );

            HttpResponse.sendYES(res, 200, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getAllEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await EventService.getAllVisibleEvent(
                req.user?.userId as string,
                page,
                limit,
                sortBy,
            );

            HttpResponse.sendYES(res, 200, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getJoinedEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await EventService.getJoinedEvent(
                req.user?.userId as string,
                page,
                limit,
                sortBy,
            );

            HttpResponse.sendYES(res, 200, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getEventById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const event = await EventService.getEventById(
                req.user?.userId as string,
                req.params.id,
            );

            HttpResponse.sendYES(res, 200, 'Event found successfully', { event });
        } catch (err) {
            next(err);
        }
    }

    async updateEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { error } = updateEventSchema.validate(req.body);
            if (error) {
                new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const { existingImages } = req.body;

            const updatedEvent = await EventService.updateEvent(
                req.user?.userId as string,
                req.params.id,
                req.files as Express.Multer.File[],
                existingImages,
                req.body,
            );

            if (!updatedEvent) {
                throw new HttpError('Event not found', 404, 'EVENT_NOT_FOUND');
            }

            const userId = (updatedEvent.participants || []).map(participant =>
                participant.userId.toString(),
            );
            await NotificationService.createNotification({
                ...NotificationService.eventUpdateNotificationContent(updatedEvent.title),
                userIds: userId,
            });

            HttpResponse.sendYES(res, 200, 'Event updated successfully', { event: updatedEvent });
        } catch (err) {
            next(err);
        }
    }

    async deleteEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const deletedEvent = await EventService.deleteEvent(
                req.user?.userId as string,
                req.params.id,
            );

            HttpResponse.sendYES(res, 200, 'Event deleted successfully', { event: deletedEvent });
            const userId = (deletedEvent.participants || []).map(participant =>
                participant.userId.toString(),
            );
            await NotificationService.createNotification({
                ...NotificationService.deleteEventNotificationContent(deletedEvent.title),
                userIds: userId,
            });
        } catch (err) {
            next(err);
        }
    }

    async joinEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.body;
            const { eventId } = req.params;

            const event = await EventService.joinEvent(userId, eventId);

            HttpResponse.sendYES(res, 201, 'Event joined/send request successfully', { event });
        } catch (err) {
            next(err);
        }
    }

    async respondEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { userId, status } = req.body;
            const { eventId } = req.params;

            const event = await EventService.replyEvent(eventId, req.user?.userId as string, {
                userId,
                status,
            });

            HttpResponse.sendYES(res, 201, 'Event responded successfully', { event });
        } catch (err) {
            next(err);
        }
    }
}
