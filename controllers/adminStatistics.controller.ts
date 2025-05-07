import { Response, NextFunction } from 'express';
import { AdminStatisticsService } from '../services/adminStatistics.service';
import { HttpResponse } from '../helpers/HttpResponse';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';

export class AdminStatisticsController {
    // API 1: Tổng quan thống kê
    static async getOverview(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await AdminStatisticsService.getOverview();
            HttpResponse.sendYES(res, 200, 'Overview statistics fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }

    // API 2: Số lượng event theo ngày tạo
    static async getEventsByDate(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await AdminStatisticsService.getEventsByDate();
            HttpResponse.sendYES(res, 200, 'Events by date fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }

    // API 3: Số lượng user theo ngày tạo
    static async getUsersByDate(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await AdminStatisticsService.getUsersByDate();
            HttpResponse.sendYES(res, 200, 'Users by date fetched successfully', data);
        } catch (err) {
            next(err);
        }
    }

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