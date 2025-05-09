import express, { Express, Router } from 'express';
import UserRouter from './userManagement.admin.route';
import AdminEventRouter from './eventManagement.admin.route';

/**
 * Admin Panel Express Application
 * 
 * This Express application serves as the admin panel for the system,
 * providing routes for user management and event management functionalities.
 * It acts as a sub-application that can be mounted on a parent Express app.
 */
const admin: Express = express();

admin.use('/user-management', UserRouter);
admin.use('/event-management', AdminEventRouter);

/**
 * Export the configured admin Express application
 * This can be mounted on the main application using:
 * mainApp.use('/admin', admin);
 */
export default admin;
