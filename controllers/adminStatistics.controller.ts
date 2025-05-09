import { Response, NextFunction } from 'express';
import { AdminStatisticsService } from '../services/adminStatistics.service';
import { HttpResponse } from '../helpers/HttpResponse';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';

/**
 * AdminStatisticsController
 * 
 * This controller handles all administrative statistics operations including:
 * - Overview statistics for the application
 * - Event creation statistics by date
 * - User registration statistics by date
 * - Account deletion statistics by date
 * 
 * All endpoints require authentication and admin privileges.
 */
export class AdminStatisticsController {
    /**
     * Retrieves overview statistics for the admin dashboard
     * 
     * This endpoint provides general statistics including total users,
     * total events, active events, and other key metrics.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @returns {Promise<void>} - Returns overview statistics data through HttpResponse
     */
    // API 1: Tổng quan thống kê
    static async getOverview(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await AdminStatisticsService.getOverview();
            HttpResponse.sendYES(res, 200, 'Overview statistics fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves event creation statistics grouped by date
     * 
     * This endpoint provides data about the number of events created
     * over time, allowing admins to track event creation trends.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @returns {Promise<void>} - Returns event creation statistics by date through HttpResponse
     */
    // API 2: Số lượng event theo ngày tạo
    static async getEventsByDate(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await AdminStatisticsService.getEventsByDate();
            HttpResponse.sendYES(res, 200, 'Events by date fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }   

    /**
     * Retrieves user registration statistics grouped by date
     * 
     * This endpoint provides data about the number of new users registered
     * over time, allowing admins to track user growth trends.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @returns {Promise<void>} - Returns user registration statistics by date through HttpResponse
     */
    // API 3: Số lượng user theo ngày tạo
    static async getUsersByDate(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await AdminStatisticsService.getUsersByDate();
            HttpResponse.sendYES(res, 200, 'Users by date fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves account deletion statistics grouped by date
     * 
     * This endpoint provides data about the number of users who deleted their accounts
     * over time, allowing admins to track account retention and churn.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @returns {Promise<void>} - Returns account deletion statistics by date through HttpResponse
     */
    // API 4: Số lượng user xóa tài khoản theo thời gian
    static async getDeletedUsersByDate(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await AdminStatisticsService.getDeletedUsersByDate();
            HttpResponse.sendYES(res, 200, 'Deleted users by date fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }
}