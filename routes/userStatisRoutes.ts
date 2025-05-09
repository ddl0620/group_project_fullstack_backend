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

/**
 * GET /statis/engagement-stats
 * 
 * Retrieves overall engagement statistics for the authenticated user
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates query parameters against engagementStatsSchema
 * @controller controller.getEngagementStats - Processes the statistics request
 * 
 * @query {Object} parameters - Query parameters for filtering statistics (e.g., date range)
 * 
 * @returns {Object} Engagement metrics including sent invitations, responses, etc.
 */
// API 1: Lấy thống kê tổng quan
userStatisRoutes.get(
    '/statis/engagement-stats',
    authenticationToken,
    validateRequest(engagementStatsSchema, 'query'),
    controller.getEngagementStats
);

/**
 * GET /statis/invitations-over-time
 * 
 * Retrieves time-series data of invitations sent over a period
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates query parameters against invitationsOverTimeSchema
 * @controller controller.getInvitationsOverTime - Processes the time-series request
 * 
 * @query {Object} parameters - Query parameters for time period and granularity
 * 
 * @returns {Object} Time-series data of invitation counts
 */
// API 2: Lấy số lời mời theo thời gian
userStatisRoutes.get(
    '/statis/invitations-over-time',
    authenticationToken,
    validateRequest(invitationsOverTimeSchema, 'query'),
    controller.getInvitationsOverTime
);

/**
 * GET /statis/rsvp-trend
 * 
 * Retrieves trend analysis of RSVP responses over time
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates query parameters against rsvpTrendSchema
 * @controller controller.getRsvpTrend - Processes the RSVP trend request
 * 
 * @query {Object} parameters - Query parameters for time period and filtering options
 * 
 * @returns {Object} RSVP trend data showing patterns in responses
 */
// API 3: Lấy xu hướng RSVP
userStatisRoutes.get(
    '/statis/rsvp-trend',
    authenticationToken,
    validateRequest(rsvpTrendSchema, 'query'),
    controller.getRsvpTrend
);

/**
 * GET /statis/rsvp-distribution
 * 
 * Retrieves distribution analysis of RSVP responses by type
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates query parameters against rsvpDistributionSchema
 * @controller controller.getRsvpDistribution - Processes the RSVP distribution request
 * 
 * @query {Object} parameters - Query parameters for filtering the distribution data
 * 
 * @returns {Object} Distribution of RSVP responses (e.g., accepted, declined, pending)
 */
// API 4: Lấy phân bố RSVP
userStatisRoutes.get(
    '/statis/rsvp-distribution',
    authenticationToken,
    validateRequest(rsvpDistributionSchema, 'query'),
    controller.getRsvpDistribution
);

/**
 * GET /statis/recipients
 * 
 * Retrieves information about invitation recipients
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware validateRequest - Validates query parameters against recipientsSchema
 * @controller controller.getRecipients - Processes the recipients request
 * 
 * @query {Object} parameters - Query parameters for filtering and sorting recipients
 * 
 * @returns {Object} List of recipients with relevant metrics
 */
// API 5: Lấy danh sách người nhận
userStatisRoutes.get(
    '/statis/recipients',
    authenticationToken,
    validateRequest(recipientsSchema, 'query'),
    controller.getRecipients
);

export default userStatisRoutes;