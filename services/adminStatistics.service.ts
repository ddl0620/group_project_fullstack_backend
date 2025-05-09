import { UserModel } from '../models/user.models';
import { DiscussionPostModel } from '../models/discussionPost.model';
import { EventModel } from '../models/event.models';
import { OverviewStats, EventsByDate, UsersByDate, DeletedUsersByDate } from '../interfaces/adminStatistics.interfaces';

export class AdminStatisticsService {

    /**
     * API 1: Get Overview Statistics
     * 
     * Retrieves comprehensive statistics about the platform, including total and active
     * counts for users, discussion posts, and events. Also includes comparative data
     * from the past week.
     * 
     * @returns {Promise<OverviewStats>} Object containing platform-wide statistics
     */
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

    /**
     * Helper method to get statistics for the past week
     * 
     * Retrieves counts of users, discussion posts, and events created
     * within the specified date range.
     * 
     * @param {Date} startDate - Beginning of the date range
     * @param {Date} endDate - End of the date range
     * @returns {Promise<Object>} Statistics for the specified period
     * @private
     */
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

    /**
     * API 2: Get Events By Creation Date
     * 
     * Aggregates event data to show the number of events created per day.
     * Results are sorted chronologically.
     * 
     * @returns {Promise<EventsByDate[]>} Array of objects containing date and event count
     */
    // API 2: Số lượng event theo ngày tạo
    static async getEventsByDate(): Promise<EventsByDate[]> {
        return await EventModel.aggregate([
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } },
        ]);
    }

    /**
     * API 3: Get Users By Creation Date
     * 
     * Aggregates user data to show the number of users registered per day.
     * Results are sorted chronologically and paginated.
     * 
     * @param {number} page - Page number for pagination (default: 1)
     * @param {number} limit - Number of results per page (default: 10)
     * @returns {Promise<UsersByDate[]>} Array of objects containing date and user count
     */
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

    /**
     * API 4: Get Deleted Users By Date
     * 
     * Aggregates data on deleted users to show the number of account deletions per day.
     * Results are sorted chronologically.
     * 
     * @returns {Promise<DeletedUsersByDate[]>} Array of objects containing date and deleted user count
     */
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