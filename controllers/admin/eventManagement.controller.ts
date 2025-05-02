import { NextFunction, Request, Response } from 'express';
import { EventService } from '../../services/event.service';

export class EventManagementController {
    static async getAllEvents(request: Request, response: Response, nextFunction: NextFunction) {
        try {
            const page = parseInt(request.query.page as string) || 1;
            const limit = parseInt(request.query.limit as string) || 10;
            const sortBy = (request.query.sortBy as string) || 'desc';

            // Assuming you have a service to fetch events
            const result = await EventService.getAll(page, limit, sortBy);

            response.status(200).json({
                message: 'Events fetched successfully',
                events: result,
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

            response.status(200).json({
                message: 'Events fetched successfully',
                events: result,
            });
        } catch (error) {
            nextFunction(error);
        }
    }
}
