import express, { Express, Router } from 'express';
import UserRouter from './userManagement.admin.route';
import EventRouter from './eventManagement.admin.route';

const admin: Express = express();

admin.use('/user-management', UserRouter);
admin.use('/event-management', EventRouter);

export default admin;
