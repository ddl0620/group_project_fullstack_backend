import { NextFunction, Response } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { EventService } from '../services/event.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { createEventSchema, updateEventSchema } from '../validation/event.validation';
import { validateInput } from '../helpers/validateInput';
import { StatusCode } from '../enums/statusCode.enums';
import { EventInterface } from '../interfaces/event.interfaces';
import { EventListResponse } from '../types/event.type';

export class EventController {
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

            //Send notification to participants

            // const userId: string[] = (deletedEvent.participants || []).map(participant =>
            //     participant.userId.toString(),
            // );
            // await NotificationService.createNotification({
            //     ...NotificationService.deleteEventNotificationContent(deletedEvent.title),
            //     userIds: userId,
            // });
        } catch (err) {
            next(err);
        }
    }

    async joinEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.body;
            const { eventId } = req.params;

            const event: EventInterface = await EventService.joinEvent(userId, eventId);
            HttpResponse.sendYES(res, StatusCode.OK, 'Event joined/send request successfully', {
                event,
            });
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

    async updateIsOpen(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { isOpen } = req.body;
            const { eventId } = req.params;

            const updatedEvent = await EventService.updateIsOpen(eventId, isOpen);
            HttpResponse.sendYES(res, StatusCode.OK, 'Event status updated successfully', {
                event: updatedEvent,
            });
        } catch (err) {
            next(err);
        }
    }
}
