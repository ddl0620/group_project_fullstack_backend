import express, { Express, Request, Response } from 'express';
import http from 'http';

import { PORT } from './config/env';
import connectToDB from './database/mongodb';
import applyGlobalMiddleware from './middlewares';
import errorMiddleware from './middlewares/error.middlewares';
import applyRoutes from './routes';
import CronScheduleBuilder from './helpers/CronScheduleBuilder';
import { CronManager } from './cron/cronManager';
const app: Express = express();
const server = http.createServer(app);

//Middlewares
applyGlobalMiddleware(app);

//Routes
applyRoutes(app);

// Error handling middleware
app.use(errorMiddleware);

app.get('/', (_req: Request, res: Response): void => {
    res.send('Backend: Fullstack Group Project\n');
});

// Cron job example
const schedule: string = new CronScheduleBuilder().minute('every').build();
// Register a job with the CronManager

const action = async (): Promise<void> => {
    console.log('Cron job executed');
    // Add your job logic here
};

CronManager.getInstance().registerJob('testing', schedule, action);

// 🚀 Start Server
server.listen(PORT, async (): Promise<void> => {
    await connectToDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

export default app;
