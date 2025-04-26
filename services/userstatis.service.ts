import mongoose from 'mongoose';
import { InvitationModel } from '../models/Invitation/invitation.models';
import { UserModel } from '../models/user.models';
import { HttpError } from '../helpers/httpsError.helpers';
import { RSVPStatus } from '../interfaces/Invitation/rsvp.interface';

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

interface InvitationsOverTime {
    date: string;
    invitations: number;
}

interface RsvpTrend {
    date: string;
    accepted: number;
    denied: number;
    pending: number;
}

interface RsvpDistribution {
    status: string;
    value: number;
}

interface Recipient {
    id: string;
    name: string;
    email: string;
    rsvp: string;
    respondedAt: string;
    avatar: string;
}

interface RecipientsResponse {
    recipients: Recipient[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
}

export class UserStatisService {
    /**
     * Get engagement statistics for the dashboard
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