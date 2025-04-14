import { Response, NextFunction } from 'express';
import { HttpError } from '../helpers/httpsError.helpers';
import { EventService } from '../service/event.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';

export class EventController {
    async addEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log('add an event');

            if (!req.user?.userId) {
                throw new HttpError(
                    'Authentication required',
                    401,
                    'AUTH_REQUIRED'
                );
            }

            const newEvent = await EventService.addEvent(req.user.userId, {
                ...req.body,
                organizer: req.user.userId,
            });

            res.status(201).json({
                success: true,
                message: 'Event added successfully',
                data: {
                    event: newEvent,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async getMyEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log('getting my event');

            if (!req.user?.userId) {
                throw new HttpError(
                    'Authentication required',
                    401,
                    'AUTH_REQUIRED'
                );
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await EventService.getMyEvents(
                req.user.userId,
                page,
                limit,
                sortBy
            );

            res.status(200).json({
                success: true,
                message: 'Event fetched successfully',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAllEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log('getting event');

            if (!req.user?.userId) {
                throw new HttpError(
                    'Authentication required',
                    401,
                    'AUTH_REQUIRED'
                );
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'desc';

            const result = await EventService.getAllEvents(
                req.user.userId,
                page,
                limit,
                sortBy
            );

            res.status(200).json({
                success: true,
                message: 'Event fetched successfully',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    async getEventById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log('getting event by ID');

            if (!req.user?.userId) {
                throw new HttpError(
                    'Authentication required',
                    401,
                    'AUTH_REQUIRED'
                );
            }

            const event = await EventService.getEventById(
                req.user.userId,
                req.params.id
            );

            res.status(200).json({
                success: true,
                message: 'Event found successfully',
                data: {
                    event,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async updateEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log('update event');

            if (!req.user?.userId) {
                throw new HttpError(
                    'Authentication required',
                    401,
                    'AUTH_REQUIRED'
                );
            }

            const updatedEvent = await EventService.updateEvent(
                req.user.userId,
                req.params.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: 'Event updated successfully',
                data: {
                    updatedEvent,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async deleteEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            console.log('deleting event');

            if (!req.user?.userId) {
                throw new HttpError(
                    'Authentication required',
                    401,
                    'AUTH_REQUIRED'
                );
            }

            const deletedEvent = await EventService.deleteEvent(
                req.user.userId,
                req.params.id
            );

            res.status(200).json({
                success: true,
                message: 'Event deleted successfully',
                data: {
                    deletedEvent,
                },
            });
        } catch (err) {
            next(err);
        }
    }
}
