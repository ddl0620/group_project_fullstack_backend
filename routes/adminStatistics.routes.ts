import { Router } from 'express';
import { AdminStatisticsController } from '../controllers/adminStatistics.controller';
import { authenticationToken, adminOnlyMiddleware } from '../middlewares/auth.middleware';
import {validateRequest} from '../middlewares/validation.middleware';
import {
    eventsByDateSchema,
    usersByDateSchema,
    deletedUsersByDateSchema,
} from '../validation/adminStatistics.validation';

const router = Router();

router.get(
    '/statistics/overview',
    authenticationToken,
    adminOnlyMiddleware, 
    AdminStatisticsController.getOverview,
);

router.get(
    '/statistics/events-by-date',
    authenticationToken,
    adminOnlyMiddleware, 
    validateRequest(eventsByDateSchema, 'query'),
    AdminStatisticsController.getEventsByDate,
);

router.get(
    '/statistics/users-by-date',
    authenticationToken,
    adminOnlyMiddleware, // Chỉ admin được phép truy cập
    validateRequest(usersByDateSchema, 'query'),
    AdminStatisticsController.getUsersByDate,
);

router.get(
    '/statistics/deleted-users-by-date',
    authenticationToken,
    adminOnlyMiddleware, // Chỉ admin được phép truy cập
    validateRequest(deletedUsersByDateSchema, 'query'),
    AdminStatisticsController.getDeletedUsersByDate,
);

export default router;