import express, { Express, Request, Response } from 'express';
import http from 'http';

import { PORT } from './config/env';
import connectToDB from './database/mongodb';
import applyGlobalMiddleware from './middlewares';
import errorMiddleware from './middlewares/error.middlewares';
import applyRoutes from './routes';

import cronManager from './cron/cronManager';
import { cronConfig } from './cron/cronConfig';

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


// Khởi động jobs tĩnh
cronManager.init();

// Đăng ký job động (ví dụ)
const customAction = async (): Promise<void> => {
  console.log('Running custom notification job...');
  // Logic tùy chỉnh
};

cronManager.registerDynamicJob(
  'customNotification',
  '*/5 * * * *', // Chạy mỗi 5 phút
  customAction,
  { timezone: cronConfig.defaultTimezone }
);

// 🚀 Start Server
server.listen(PORT, async (): Promise<void> => {
    await connectToDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

export default app;
