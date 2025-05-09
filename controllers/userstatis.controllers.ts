import { Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { UserStatisService } from '../services/userstatis.service';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import {HttpError} from "../helpers/httpsError.helpers";
import {invitationsOverTimeSchema, recipientsSchema, rsvpTrendSchema} from "../validation/userstatis.validation";
/**
 * UserStatisController
 * 
 * This controller handles all operations related to user statistics and analytics, including:
 * - Engagement statistics for dashboard visualization
 * - Invitation trends over time
 * - RSVP trends and distribution analysis
 * - Recipient data for reporting
 * 
 * All endpoints require authentication through AuthenticationRequest and
 * provide data specifically for the authenticated user's events and invitations.
 */
export class UserStatisController {
    /**
     * Get engagement statistics for the dashboard
     * 
     * This endpoint retrieves key engagement metrics for the authenticated user's
     * events and invitations within an optional date range.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.user.userId - ID of the authenticated user
     * @param {string} [req.query.startDate] - Optional start date for filtering statistics
     * @param {string} [req.query.endDate] - Optional end date for filtering statistics
     * @returns {Promise<void>} - Returns engagement statistics through HttpResponse
     * @throws {HttpError} - Throws 401 error if user is not authenticated
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
     * Get invitations sent over time for chart visualization
     * 
     * This endpoint retrieves time-series data showing invitation patterns
     * for the authenticated user within a specified date range and interval.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.user.userId - ID of the authenticated user
     * @param {string} req.query.startDate - Start date for the time series
     * @param {string} req.query.endDate - End date for the time series
     * @param {'daily'|'weekly'} req.query.interval - Time interval for data aggregation
     * @returns {Promise<void>} - Returns time-series invitation data through HttpResponse
     * @throws {HttpError} - Throws 401 error if user is not authenticated or 400 if validation fails
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
     * Get RSVP trend for chart visualization
     * 
     * This endpoint retrieves time-series data showing RSVP response trends
     * for the authenticated user's events within a specified date range and interval.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.user.userId - ID of the authenticated user
     * @param {string} req.query.startDate - Start date for the time series
     * @param {string} req.query.endDate - End date for the time series
     * @param {'daily'|'weekly'} req.query.interval - Time interval for data aggregation
     * @returns {Promise<void>} - Returns time-series RSVP trend data through HttpResponse
     * @throws {HttpError} - Throws 401 error if user is not authenticated or 400 if validation fails
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
     * Get RSVP distribution for chart visualization
     * 
     * This endpoint retrieves aggregated data showing the distribution of RSVP responses
     * (accepted, denied, pending) for the authenticated user's events within an optional date range.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.user.userId - ID of the authenticated user
     * @param {string} [req.query.startDate] - Optional start date for filtering data
     * @param {string} [req.query.endDate] - Optional end date for filtering data
     * @returns {Promise<void>} - Returns RSVP distribution data through HttpResponse
     * @throws {HttpError} - Throws 401 error if user is not authenticated
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
     * Get recipients list for tabular display
     * 
     * This endpoint retrieves paginated recipient data for the authenticated user's events,
     * with optional filtering by RSVP status and search term.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.user.userId - ID of the authenticated user
     * @param {number} req.query.page - Page number for pagination
     * @param {number} req.query.limit - Number of recipients per page
     * @param {'ACCEPTED'|'DENIED'|'PENDING'} [req.query.rsvpStatus] - Optional filter for RSVP status
     * @param {string} [req.query.search] - Optional search term for filtering recipients
     * @returns {Promise<void>} - Returns paginated recipient data through HttpResponse
     * @throws {HttpError} - Throws 401 error if user is not authenticated or 400 if validation fails
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