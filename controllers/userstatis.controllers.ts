import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { UserStatisService } from '../services/userstatis.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import {HttpError} from "../helpers/httpsError.helpers";
import {invitationsOverTimeSchema, recipientsSchema, rsvpTrendSchema} from "../validation/userstatis.validation";
export class UserStatisController {
    /**
     * Get engagement statistics for the dashboard
     */
    async getEngagementStats(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
            const stats = await UserStatisService.getEngagementStats(req.user.userId, startDate, endDate);
            HttpResponse.sendYES(res, 200, 'Engagement stats fetched successfully', stats);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get invitations sent over time for chart
     */
    async getInvitationsOverTime(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const { error, value } = invitationsOverTimeSchema.validate(req.query, { abortEarly: false });
            if (error) {
                throw new HttpError(error.details.map((detail) => detail.message).join(', '), 400, 'INVALID_INPUT');
            }

            const { startDate, endDate, interval } = value as {
                startDate: string;
                endDate: string;
                interval: 'daily' | 'weekly';
            };

            const data = await UserStatisService.getInvitationsOverTime(
                req.user.userId,
                startDate,
                endDate,
                interval
            );
            HttpResponse.sendYES(res, 200, 'Invitations over time fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get RSVP trend for chart
     */
    async getRsvpTrend(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const { error, value } = rsvpTrendSchema.validate(req.query, { abortEarly: false });
            if (error) {
                throw new HttpError(error.details.map((detail) => detail.message).join(', '), 400, 'INVALID_INPUT');
            }

            const { startDate, endDate, interval } = value as {
                startDate: string;
                endDate: string;
                interval: 'daily' | 'weekly';
            };

            const data = await UserStatisService.getRsvpTrend(
                req.user.userId,
                startDate,
                endDate,
                interval
            );
            HttpResponse.sendYES(res, 200, 'RSVP trend fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get RSVP distribution for chart
     */
    async getRsvpDistribution(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
            const data = await UserStatisService.getRsvpDistribution(req.user.userId, startDate, endDate);
            HttpResponse.sendYES(res, 200, 'RSVP distribution fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get recipients list for table
     */
    async getRecipients(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                throw new HttpError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            // Validate query parameters
            const { error, value } = recipientsSchema.validate(req.query, { abortEarly: false });
            if (error) {
                throw new HttpError(error.details.map((detail) => detail.message).join(', '), 400, 'INVALID_INPUT');
            }

            const { page, limit, rsvpStatus, search } = value as {
                page: number;
                limit: number;
                rsvpStatus?: string;
                search?: string;
            };

            const data = await UserStatisService.getRecipients(
                req.user.userId,
                page,
                limit,
                rsvpStatus as 'ACCEPTED' | 'DENIED' | 'PENDING' | undefined,
                search
            );
            HttpResponse.sendYES(res, 200, 'Recipients fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }
}