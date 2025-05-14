import { Express } from 'express';
// Auth
import authRoutes from './auth.routes';

// User
import userRoutes from './user.routes';
import userStatisRoutes from './userStatisRoutes';
import adminRoute from './admin/admin.route';

// Event
import eventRoutes from './event.routes';
import invitationRoutes from './invitation.routes';
import notificationRoutes from './notification.routes';

// Discussion
import discussionPostRoutes from './discussionPost.routes';
import discussionReplyRoutes from './discussionReply.routes';

import adminStatisticsRoutes from './adminStatistics.routes';
import feedbackRoutes from './feedback.routes';

/**
 * Apply Routes
 *
 * This function registers all API routes with the Express application.
 * Routes are organized by feature domain and follow a consistent API versioning pattern.
 *
 * @param {Express} app - The Express application instance
 */
const applyRoutes = (app: Express) => {
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/feedback', feedbackRoutes);

    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/userstatis', userStatisRoutes);
    app.use('/api/v1/admin', adminRoute);

    app.use('/api/v1/event', eventRoutes);
    app.use('/api/v1/invitation', invitationRoutes);
    app.use('/api/v1/notification', notificationRoutes);

    app.use('/api/v1/discussion-posts', discussionPostRoutes);
    app.use('/api/v1/discussion-replies', discussionReplyRoutes);
    app.use('/api/v1/adminstatis', adminStatisticsRoutes);
};

export default applyRoutes;
