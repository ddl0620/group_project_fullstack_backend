import { Router } from 'express';
import { authenticationToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
    engagementStatsSchema,
    invitationsOverTimeSchema,
    rsvpTrendSchema,
    rsvpDistributionSchema,
    recipientsSchema,
} from '../validation/userstatis.validation';
import {UserStatisController} from "../controllers/userstatis.controllers";

const userStatisRoutes = Router();
const controller = new UserStatisController();

// API 1: Lấy thống kê tổng quan
userStatisRoutes.get(
    '/statis/engagement-stats',
    authenticationToken,
    validateRequest(engagementStatsSchema, 'query'),
    controller.getEngagementStats
);

// API 2: Lấy số lời mời theo thời gian
userStatisRoutes.get(
    '/statis/invitations-over-time',
    authenticationToken,
    validateRequest(invitationsOverTimeSchema, 'query'),
    controller.getInvitationsOverTime
);

// API 3: Lấy xu hướng RSVP
userStatisRoutes.get(
    '/statis/rsvp-trend',
    authenticationToken,
    validateRequest(rsvpTrendSchema, 'query'),
    controller.getRsvpTrend
);

// API 4: Lấy phân bố RSVP
userStatisRoutes.get(
    '/statis/rsvp-distribution',
    authenticationToken,
    validateRequest(rsvpDistributionSchema, 'query'),
    controller.getRsvpDistribution
);

// API 5: Lấy danh sách người nhận
userStatisRoutes.get(
    '/statis/recipients',
    authenticationToken,
    validateRequest(recipientsSchema, 'query'),
    controller.getRecipients
);

export default userStatisRoutes;