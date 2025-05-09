import mongoose from 'mongoose';
import { InvitationModel } from '../models/Invitation/invitation.models';
import { UserModel } from '../models/user.models';
import { HttpError } from '../helpers/httpsError.helpers';
import { RSVPStatus } from '../interfaces/Invitation/rsvp.interface';

/**
 * Interface for engagement statistics
 * 
 * Contains metrics about invitations and RSVPs for current and previous periods
 */
interface EngagementStats {
    totalInvitations: number;
    acceptedRSVPs: number;
    deniedRSVPs: number;
    pendingRSVPs: number;
    previousWeek: {
        totalInvitations: number;
        acceptedRSVPs: number;
        deniedRSVPs: number;
        pendingRSVPs: number;
    };
}

/**
 * Interface for invitation trend data
 * 
 * Tracks invitation counts over time
 */
interface InvitationsOverTime {
    date: string;
    invitations: number;
}

/**
 * Interface for RSVP trend data
 * 
 * Tracks RSVP status counts over time
 */
interface RsvpTrend {
    date: string;
    accepted: number;
    denied: number;
    pending: number;
}

/**
 * Interface for RSVP distribution data
 * 
 * Contains summary counts for each RSVP status
 */
interface RsvpDistribution {
    status: string;
    value: number;
}

/**
 * Interface for recipient data
 * 
 * Contains information about an invitation recipient
 */
interface Recipient {
    id: string;
    name: string;
    email: string;
    rsvp: string;
    respondedAt: string;
    avatar: string;
}

/**
 * Interface for paginated recipients response
 * 
 * Contains recipient list and pagination metadata
 */
interface RecipientsResponse {
    recipients: Recipient[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
}


/**
 * User Statistics Service
 * 
 * This service provides analytics and reporting functionality for user invitations
 * and RSVPs. It offers methods to retrieve engagement metrics, trends over time,
 * and recipient information for dashboard displays and reporting.
 */
export class UserStatisService {
    /**
     * Get engagement statistics for the dashboard
     * 
     * Retrieves invitation and RSVP metrics for the current period and compares
     * them with the previous period for trend analysis.
     * 
     * @param {string} userId - ID of the user requesting statistics
     * @param {string} [startDate] - Optional start date for the period (defaults to start of current week)
     * @param {string} [endDate] - Optional end date for the period (defaults to current date)
     * @returns {Promise<EngagementStats>} Statistics for current and previous periods
     * @throws {HttpError} If user ID is invalid
     */
    static async getEngagementStats(
        userId: string,
        startDate?: string,
        endDate?: string
    ): Promise<EngagementStats> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const now = new Date();
        const currentStart = startDate ? new Date(startDate) : new Date(now.setDate(now.getDate() - now.getDay()));
        const currentEnd = endDate ? new Date(endDate) : new Date();
        const prevStart = new Date(currentStart);
        prevStart.setDate(prevStart.getDate() - 7);
        const prevEnd = new Date(currentEnd);
        prevEnd.setDate(prevEnd.getDate() - 7);

        const currentStats = await this.getStats(userId, currentStart, currentEnd);
        const prevStats = await this.getStats(userId, prevStart, prevEnd);

        return {
            totalInvitations: currentStats.totalInvitations,
            acceptedRSVPs: currentStats.acceptedRSVPs,
            deniedRSVPs: currentStats.deniedRSVPs,
            pendingRSVPs: currentStats.pendingRSVPs,
            previousWeek: prevStats,
        };
    }

    /**
     * Helper method to retrieve invitation statistics for a specific period
     * 
     * Counts invitations and aggregates RSVP responses for the given date range.
     * 
     * @param {string} userId - ID of the user
     * @param {Date} startDate - Start date for the period
     * @param {Date} endDate - End date for the period
     * @returns {Promise<{totalInvitations: number, acceptedRSVPs: number, deniedRSVPs: number, pendingRSVPs: number}>}
     * @private
     */
    private static async getStats(userId: string, startDate: Date, endDate: Date) {
        // Đếm tổng số lời mời trong khoảng thời gian
        const invitations = await InvitationModel.countDocuments({
            invitorId: userId,
            isDeleted: false,
            sentAt: { $gte: startDate, $lte: endDate },
        });

        // Lấy tất cả lời mời trong khoảng thời gian và join với RSVPModel
        const invitationStats = await InvitationModel.aggregate([
            {
                $match: {
                    invitorId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                    sentAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $lookup: {
                    from: 'rsvps',
                    localField: '_id',
                    foreignField: 'invitationId',
                    as: 'rsvp',
                },
            },
            {
                $unwind: {
                    path: '$rsvp',
                    preserveNullAndEmptyArrays: true, // Giữ các lời mời không có RSVP
                },
            },
            // Chuyển các trạng thái không hợp lệ thành PENDING và xử lý các lời mời không có RSVP
            {
                $addFields: {
                    'rsvp.response': {
                        $cond: [
                            { $eq: ['$rsvp', null] }, // Nếu không có RSVP
                            RSVPStatus.PENDING,
                            {
                                $cond: [
                                    { $in: ['$rsvp.response', [RSVPStatus.ACCEPTED, RSVPStatus.DENIED, RSVPStatus.PENDING]] },
                                    '$rsvp.response',
                                    RSVPStatus.PENDING,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: '$rsvp.response',
                    count: { $sum: 1 },
                },
            },
        ]);

        console.log('Invitation Stats:', invitationStats);

        const acceptedRSVPs = invitationStats.find((stat) => stat._id === RSVPStatus.ACCEPTED)?.count || 0;
        const deniedRSVPs = invitationStats.find((stat) => stat._id === RSVPStatus.DENIED)?.count || 0;
        const pendingRSVPs = invitationStats.find((stat) => stat._id === RSVPStatus.PENDING)?.count || 0;

        return {
            totalInvitations: invitations,
            acceptedRSVPs,
            deniedRSVPs,
            pendingRSVPs,
        };
    }

    /**
     * Get invitations sent over time
     * 
     * Retrieves a time series of invitation counts, grouped by day or week.
     * 
     * @param {string} userId - ID of the user
     * @param {string} startDate - Start date for the period (YYYY-MM-DD)
     * @param {string} endDate - End date for the period (YYYY-MM-DD)
     * @param {'daily' | 'weekly'} interval - Time grouping interval (daily or weekly)
     * @returns {Promise<InvitationsOverTime[]>} Time series data of invitation counts
     * @throws {HttpError} If user ID or date format is invalid
     */
    static async getInvitationsOverTime(
        userId: string,
        startDate: string,
        endDate: string,
        interval: 'daily' | 'weekly' = 'daily'
    ): Promise<InvitationsOverTime[]> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new HttpError('Invalid date format', 400, 'INVALID_DATE');
        }

        const groupBy = interval === 'daily' ? {
            $dateToString: { format: '%Y-%m-%d', date: '$sentAt' },
        } : {
            $concat: [
                { $toString: { $year: '$sentAt' } },
                '-W',
                { $toString: { $week: '$sentAt' } },
            ],
        };

        const pipeline: mongoose.PipelineStage[] = [
            {
                $match: {
                    invitorId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                    sentAt: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: groupBy,
                    invitations: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $project: {
                    date: '$_id',
                    invitations: 1,
                    _id: 0,
                },
            },
        ];

        return await InvitationModel.aggregate(pipeline).exec();
    }

    /**
     * Get RSVP trend over time
     * 
     * Retrieves a time series of RSVP responses by status, grouped by day or week.
     * 
     * @param {string} userId - ID of the user
     * @param {string} startDate - Start date for the period (YYYY-MM-DD)
     * @param {string} endDate - End date for the period (YYYY-MM-DD)
     * @param {'daily' | 'weekly'} interval - Time grouping interval (daily or weekly)
     * @returns {Promise<RsvpTrend[]>} Time series data of RSVP responses by status
     * @throws {HttpError} If user ID or date format is invalid
     */
    static async getRsvpTrend(
        userId: string,
        startDate: string,
        endDate: string,
        interval: 'daily' | 'weekly' = 'daily'
    ): Promise<RsvpTrend[]> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new HttpError('Invalid date format', 400, 'INVALID_DATE');
        }

        const groupBy = interval === 'daily' ? {
            $dateToString: { format: '%Y-%m-%d', date: '$sentAt' },
        } : {
            $concat: [
                { $toString: { $year: '$sentAt' } },
                '-W',
                { $toString: { $week: '$sentAt' } },
            ],
        };

        const pipeline: mongoose.PipelineStage[] = [
            // Lấy tất cả lời mời của user
            {
                $match: {
                    invitorId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                    sentAt: { $gte: start, $lte: end },
                },
            },
            // Join với RSVPModel
            {
                $lookup: {
                    from: 'rsvps',
                    localField: '_id',
                    foreignField: 'invitationId',
                    as: 'rsvp',
                },
            },
            {
                $unwind: {
                    path: '$rsvp',
                    preserveNullAndEmptyArrays: true, // Giữ các lời mời không có RSVP
                },
            },
            // Chỉ lấy các RSVP trong khoảng thời gian
            {
                $match: {
                    $or: [
                        { 'rsvp.respondedAt': { $gte: start, $lte: end } },
                        { 'rsvp': null }, // Hoặc không có RSVP
                    ],
                },
            },
            // Chuyển các trạng thái không hợp lệ và xử lý các lời mời không có RSVP
            {
                $addFields: {
                    'rsvp.response': {
                        $cond: [
                            { $eq: ['$rsvp', null] }, // Nếu không có RSVP
                            RSVPStatus.PENDING,
                            {
                                $cond: [
                                    { $in: ['$rsvp.response', [RSVPStatus.ACCEPTED, RSVPStatus.DENIED, RSVPStatus.PENDING]] },
                                    '$rsvp.response',
                                    RSVPStatus.PENDING,
                                ],
                            },
                        ],
                    },
                    // Sử dụng sentAt nếu không có RSVP, respondedAt nếu có
                    effectiveDate: {
                        $ifNull: ['$rsvp.respondedAt', '$sentAt'],
                    },
                },
            },
            {
                $group: {
                    _id: {
                        date: groupBy,
                        response: '$rsvp.response',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: '$_id.date',
                    responses: {
                        $push: {
                            response: '$_id.response',
                            count: '$count',
                        },
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $project: {
                    date: '$_id',
                    accepted: {
                        $sum: {
                            $cond: [{ $eq: ['$responses.response', RSVPStatus.ACCEPTED] }, '$responses.count', 0],
                        },
                    },
                    denied: {
                        $sum: {
                            $cond: [{ $eq: ['$responses.response', RSVPStatus.DENIED] }, '$responses.count', 0],
                        },
                    },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$responses.response', RSVPStatus.PENDING] }, '$responses.count', 0],
                        },
                    },
                    _id: 0,
                },
            },
        ];

        return await InvitationModel.aggregate(pipeline).exec();
    }

    /**
     * Get RSVP distribution
     * 
     * Retrieves the count of invitations by RSVP status for a specified period.
     * 
     * @param {string} userId - ID of the user
     * @param {string} [startDate] - Optional start date for the period
     * @param {string} [endDate] - Optional end date for the period
     * @returns {Promise<RsvpDistribution[]>} Distribution of invitations by RSVP status
     * @throws {HttpError} If user ID or date format is invalid
     */
    static async getRsvpDistribution(
        userId: string,
        startDate?: string,
        endDate?: string
    ): Promise<RsvpDistribution[]> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const match: any = {
            invitorId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
        };

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new HttpError('Invalid date format', 400, 'INVALID_DATE');
            }
            match.sentAt = { $gte: start, $lte: end };
        }

        const pipeline: mongoose.PipelineStage[] = [
            { $match: match },
            // Join với RSVPModel
            {
                $lookup: {
                    from: 'rsvps',
                    localField: '_id',
                    foreignField: 'invitationId',
                    as: 'rsvp',
                },
            },
            {
                $unwind: {
                    path: '$rsvp',
                    preserveNullAndEmptyArrays: true, // Giữ các lời mời không có RSVP
                },
            },
            // Nếu có startDate và endDate, lọc thêm theo respondedAt
            ...(startDate && endDate ? [{
                $match: {
                    $or: [
                        { 'rsvp.respondedAt': { $gte: new Date(startDate), $lte: new Date(endDate) } },
                        { 'rsvp': null }, // Hoặc không có RSVP
                    ],
                },
            }] : []),
            // Chuyển các trạng thái không hợp lệ và xử lý các lời mời không có RSVP
            {
                $addFields: {
                    'rsvp.response': {
                        $cond: [
                            { $eq: ['$rsvp', null] }, // Nếu không có RSVP
                            RSVPStatus.PENDING,
                            {
                                $cond: [
                                    { $in: ['$rsvp.response', [RSVPStatus.ACCEPTED, RSVPStatus.DENIED, RSVPStatus.PENDING]] },
                                    '$rsvp.response',
                                    RSVPStatus.PENDING,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: '$rsvp.response',
                    value: { $sum: 1 },
                },
            },
            {
                $project: {
                    status: {
                        $cond: [
                            { $eq: ['$_id', RSVPStatus.ACCEPTED] },
                            'Accepted',
                            { $cond: [{ $eq: ['$_id', RSVPStatus.DENIED] }, 'Denied', 'Pending'] },
                        ],
                    },
                    value: 1,
                    _id: 0,
                },
            },
        ];

        return await InvitationModel.aggregate(pipeline).exec();
    }

    /**
     * Get recipients list
     * 
     * Retrieves a paginated list of invitation recipients with their RSVP status.
     * Supports filtering by RSVP status and searching by name or email.
     * 
     * @param {string} userId - ID of the user
     * @param {number} [page=1] - Page number for pagination
     * @param {number} [limit=10] - Number of recipients per page
     * @param {'ACCEPTED' | 'DENIED' | 'PENDING'} [rsvpStatus] - Optional filter by RSVP status
     * @param {string} [search] - Optional search term for filtering by name or email
     * @returns {Promise<RecipientsResponse>} Paginated list of recipients and pagination metadata
     * @throws {HttpError} If user ID is invalid
     */
    static async getRecipients(
        userId: string,
        page: number = 1,
        limit: number = 10,
        rsvpStatus?: 'ACCEPTED' | 'DENIED' | 'PENDING',
        search?: string
    ): Promise<RecipientsResponse> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
        }

        const skip = (page - 1) * limit;
        const match: any = {
            invitorId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
        };

        if (search) {
            const users = await UserModel.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            }).select('_id');
            match.inviteeId = { $in: users.map((u) => u._id) };
        }

        const pipeline: mongoose.PipelineStage[] = [
            { $match: match },
            {
                $lookup: {
                    from: 'users',
                    localField: 'inviteeId',
                    foreignField: '_id',
                    as: 'invitee',
                },
            },
            { $unwind: '$invitee' },
            {
                $lookup: {
                    from: 'rsvps',
                    localField: '_id',
                    foreignField: 'invitationId',
                    as: 'rsvp',
                },
            },
            {
                $unwind: {
                    path: '$rsvp',
                    preserveNullAndEmptyArrays: true, // Giữ các lời mời không có RSVP
                },
            },
            // Chuyển các trạng thái không hợp lệ và xử lý các lời mời không có RSVP
            {
                $addFields: {
                    'rsvp.response': {
                        $cond: [
                            { $eq: ['$rsvp', null] }, // Nếu không có RSVP
                            RSVPStatus.PENDING,
                            {
                                $cond: [
                                    { $in: ['$rsvp.response', [RSVPStatus.ACCEPTED, RSVPStatus.DENIED, RSVPStatus.PENDING]] },
                                    '$rsvp.response',
                                    RSVPStatus.PENDING,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $match: rsvpStatus ? { 'rsvp.response': rsvpStatus } : {},
            },
            {
                $project: {
                    id: '$_id',
                    name: '$invitee.name',
                    email: '$invitee.email',
                    rsvp: { $ifNull: ['$rsvp.response', RSVPStatus.PENDING] },
                    respondedAt: {
                        $ifNull: [
                            { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$rsvp.respondedAt' } },
                            null,
                        ],
                    },
                    avatar: '/placeholder.svg?height=32&width=32',
                    _id: 0,
                },
            },
            { $sort: { respondedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ];

        const recipients = await InvitationModel.aggregate(pipeline).exec();
        const total = await InvitationModel.countDocuments(match);

        return {
            recipients,
            pagination: {
                total,
                page,
                limit,
            },
        };
    }
}