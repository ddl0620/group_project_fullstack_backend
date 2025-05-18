import express, { Express, Request, Response } from 'express';
import http from 'http';

import { PORT } from './config/env';
import connectToDB from './database/mongodb';
import applyGlobalMiddleware from './middlewares';
import errorMiddleware from './middlewares/error.middlewares';
import applyRoutes from './routes';
import { CronManager } from './cron/cronManager';
import dotenv from 'dotenv';
/**
 * Express application instance
 *
 * Primary Express application object that handles HTTP requests,
 * middleware application, and route definitions.
 */

const app: Express = express();
/**
 * HTTP server instance
 *
 * Creates an HTTP server using the Express application as the request handler.
 * This separation allows for potential future extensions like WebSockets.
 */
const server = http.createServer(app);
//Middlewares
applyGlobalMiddleware(app);

//Routes
applyRoutes(app);

// Error handling middleware
app.use(errorMiddleware);

/**
 * Root endpoint handler
 *
 * Simple health check endpoint that confirms the server is running.
 * Returns a basic text response indicating the application name.
 *
 * @param _req - Express request object (unused, prefixed with underscore)
 * @param res - Express response object used to send the health check message
 */
app.get('/', (_req: Request, res: Response): void => {
    res.send('Backend: Fullstack Group Project\n');
});

/**
 * Server initialization
 *
 * Starts the HTTP server on the configured port and establisheshhhhgb
 * a connection to the MongoDB database.
 * Logs confirmation message when server is successfully running.
 */
// 🚀 Start Server
server.listen(PORT, async (): Promise<void> => {
    await connectToDB();
    CronManager.getInstance();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

export default app;
