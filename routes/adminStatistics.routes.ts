import { Router } from 'express';
import { AdminStatisticsController } from '../controllers/adminStatistics.controller';
import { authenticationToken, adminOnlyMiddleware } from '../middlewares/auth.middleware';
import {validateRequest} from '../middlewares/validation.middleware';
import {
    eventsByDateSchema,
    usersByDateSchema,
    deletedUsersByDateSchema,
} from '../validation/adminStatistics.validation';

/**
 * Admin Statistics Router
 * 
 * This router provides endpoints for retrieving various administrative statistics
 * about the system, including overview metrics and time-based analytics.
 * All routes are protected by authentication and admin-only access controls.
 */
const router = Router();

/**
 * GET /statistics/overview
 * 
 * Retrieves a general overview of system statistics for the admin dashboard
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @controller AdminStatisticsController.getOverview - Compiles and returns overview statistics
 * 
 * @returns {Object} Dashboard statistics including user counts, event metrics, etc.
 */
router.get(
    '/statistics/overview',
    authenticationToken,
    adminOnlyMiddleware, 
    AdminStatisticsController.getOverview,
);

/**
 * GET /statistics/events-by-date
 * 
 * Retrieves event statistics filtered by date range
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @middleware validateRequest - Validates query parameters against eventsByDateSchema
 * @controller AdminStatisticsController.getEventsByDate - Retrieves date-based event metrics
 * 
 * @query {Object} Query parameters validated by eventsByDateSchema (likely start/end dates)
 * @returns {Object} Event statistics within the specified date range
 */
router.get(
    '/statistics/events-by-date',
    authenticationToken,
    adminOnlyMiddleware, 
    validateRequest(eventsByDateSchema, 'query'),
    AdminStatisticsController.getEventsByDate,
);

/**
 * GET /statistics/users-by-date
 * 
 * Retrieves user registration statistics filtered by date range
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @middleware validateRequest - Validates query parameters against usersByDateSchema
 * @controller AdminStatisticsController.getUsersByDate - Retrieves date-based user metrics
 * 
 * @query {Object} Query parameters validated by usersByDateSchema (likely start/end dates)
 * @returns {Object} User registration statistics within the specified date range
 */
router.get(
    '/statistics/users-by-date',
    authenticationToken,
    adminOnlyMiddleware, // Chỉ admin được phép truy cập
    validateRequest(usersByDateSchema, 'query'),
    AdminStatisticsController.getUsersByDate,
);

/**
 * GET /statistics/deleted-users-by-date
 * 
 * Retrieves statistics about deleted users filtered by date range
 * 
 * @middleware authenticationToken - Verifies the user is logged in
 * @middleware adminOnlyMiddleware - Ensures only admin users can access this route
 * @middleware validateRequest - Validates query parameters against deletedUsersByDateSchema
 * @controller AdminStatisticsController.getDeletedUsersByDate - Retrieves date-based deleted user metrics
 * 
 * @query {Object} Query parameters validated by deletedUsersByDateSchema (likely start/end dates)
 * @returns {Object} Deleted user statistics within the specified date range
 */
router.get(
    '/statistics/deleted-users-by-date',
    authenticationToken,
    adminOnlyMiddleware, // Chỉ admin được phép truy cập
    validateRequest(deletedUsersByDateSchema, 'query'),
    AdminStatisticsController.getDeletedUsersByDate,
);

router.get(
    '/statistics/public-private-events',
    authenticationToken,
    adminOnlyMiddleware,
    AdminStatisticsController.getPublicAndPrivateEvents,
);

export default router;