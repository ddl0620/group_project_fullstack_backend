import { UserModel } from '../models/user.models';
import { DiscussionPostModel } from '../models/discussionPost.model';
import { EventModel } from '../models/event.models';
import { OverviewStats, EventsByDate, UsersByDate, DeletedUsersByDate } from '../interfaces/adminStatistics.interfaces';

export class AdminStatisticsService {
    // API 1: Tổng quan thống kê
    static async getOverview(): Promise<OverviewStats> {
        const now = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);

        const totalUsers = await UserModel.countDocuments();
        const activeUsers = await UserModel.countDocuments({ isDeleted: false });
        const totalDiscussionPosts = await DiscussionPostModel.countDocuments();
        const activeDiscussionPosts = await DiscussionPostModel.countDocuments({ isDeleted: false });
        const totalEvents = await EventModel.countDocuments();
        const deletedEvents = await EventModel.countDocuments({ isDeleted: true });

        const lastWeekStats = await this.getLastWeekStats(lastWeek, now);

        return {
            totalUsers,
            activeUsers,
            totalDiscussionPosts,
            activeDiscussionPosts,
            totalEvents,
            deletedEvents,
            lastWeek: lastWeekStats,
        };
    }

    private static async getLastWeekStats(startDate: Date, endDate: Date) {
        const totalUsers = await UserModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
        const activeUsers = await UserModel.countDocuments({ isDeleted: false, createdAt: { $gte: startDate, $lte: endDate } });
        const totalDiscussionPosts = await DiscussionPostModel.countDocuments({ created_at: { $gte: startDate, $lte: endDate } });
        const activeDiscussionPosts = await DiscussionPostModel.countDocuments({ isDeleted: false, created_at: { $gte: startDate, $lte: endDate } });
        const totalEvents = await EventModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
        const deletedEvents = await EventModel.countDocuments({ isDeleted: true, createdAt: { $gte: startDate, $lte: endDate } });

        return {
            totalUsers,
            activeUsers,
            totalDiscussionPosts,
            activeDiscussionPosts,
            totalEvents,
            deletedEvents,
        };
    }

    // API 2: Số lượng event theo ngày tạo
    static async getEventsByDate(): Promise<EventsByDate[]> {
        return await EventModel.aggregate([
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } },
        ]);
    }

    // API 3: Số lượng user theo ngày tạo
    static async getUsersByDate(page: number = 1, limit: number = 10): Promise<UsersByDate[]> {
        const skip = (page - 1) * limit;
        return await UserModel.aggregate([
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { date: '$_id', count: 1, _id: 0 } },
        ]);
    }

    // API 4: Số lượng user xóa tài khoản theo thời gian
    static async getDeletedUsersByDate(): Promise<DeletedUsersByDate[]> {
        return await UserModel.aggregate([
            { $match: { isDeleted: true } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } },
        ]);
    }

    // API 5: Số lượng sự kiện công khai và riêng tư
    static async getPublicAndPrivateEvents(): Promise<{ publicEvents: number; privateEvents: number }> {
        const publicEvents = await EventModel.countDocuments({ isPublic: true });
        const privateEvents = await EventModel.countDocuments({ isPublic: false });

        return { publicEvents, privateEvents };
    }
}