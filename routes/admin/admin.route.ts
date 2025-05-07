import express, { Express, Router } from 'express';
import UserRouter from './userManagement.admin.route';
import AdminEventRouter from './eventManagement.admin.route';

const admin: Express = express();

admin.use('/user-management', UserRouter);
admin.use('/event-management', AdminEventRouter);

export default admin;
