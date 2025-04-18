import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { EventService } from '../services/event.service';
import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";

export class EventController {
    async addEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const newEvent = await EventService.addEvent(req.user?.userId as string, {
                ...req.body,
                organizer: req.user?.userId,
            });

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

            const result = await EventService.getMyEvents(req.user?.userId as string, page, limit, sortBy);

            HttpResponse.sendYES(res, 200, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getAllEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await EventService.getAllEvents(req.user?.userId as string, page, limit, sortBy);

            HttpResponse.sendYES(res, 200, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getJoinedEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await EventService.getJoinedEvent(req.user?.userId as string, page, limit, sortBy);

            HttpResponse.sendYES(res, 200, 'Event fetched successfully', result);
        } catch (err) {
            next(err);
        }
    }

    async getEventById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const event = await EventService.getEventById(req.user?.userId as string, req.params.id);

            HttpResponse.sendYES(res, 200, 'Event found successfully', { event });
        } catch (err) {
            next(err);
        }
    }

    async updateEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const updatedEvent = await EventService.updateEvent(req.user?.userId as string, req.params.id, req.body);

            HttpResponse.sendYES(res, 200, 'Event updated successfully', { event: updatedEvent });
        } catch (err) {
            next(err);
        }
    }

    async deleteEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const deletedEvent = await EventService.deleteEvent(req.user?.userId as string, req.params.id);

            HttpResponse.sendYES(res, 200, 'Event deleted successfully', { event: deletedEvent });
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

    async respondEvent(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, status } = req.body;
            const { eventId } = req.params;


            const event = await EventService.replyEvent(eventId, req.user?.userId as string, { userId, status });

            HttpResponse.sendYES(res, 201, 'Event responded successfully', { event });
        } catch (err) {
            next(err);
        }
    }
}