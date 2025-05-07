import { Router } from 'express';
import { AdminStatisticsController } from '../controllers/adminStatistics.controller';
import { authenticationToken } from '../middlewares/auth.middleware';
import validateRequest from '././../middlewares/validateRequest.middleware';
import {
    eventsByDateSchema,
    usersByDateSchema,
    deletedUsersByDateSchema,
} from '../validation/adminStatistics.validation';

const router = Router();

router.get('/statistics/overview', authenticationToken, AdminStatisticsController.getOverview);

router.get(
    '/statistics/events-by-date',
    authenticationToken,
    validateRequest(eventsByDateSchema, 'query'),
    AdminStatisticsController.getEventsByDate,
);

router.get(
    '/statistics/users-by-date',
    authenticationToken,
    validateRequest(usersByDateSchema, 'query'),
    AdminStatisticsController.getUsersByDate,
);

router.get(
    '/statistics/deleted-users-by-date',
    authenticationToken,
    validateRequest(deletedUsersByDateSchema, 'query'),
    AdminStatisticsController.getDeletedUsersByDate,
);

export default router;