import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import trimRequest from './requestTrimming';
import rateLimit from 'express-rate-limit';
import { HttpError } from '../helpers/httpsError.helpers';
import app from '../app';

const applyGlobalMiddleware = (app: express.Express) => {
    const limiter = rateLimit({
        windowMs: 2 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) => {
            throw new HttpError(
                'Too many requests, please try again later.',
                429,
                'TOO_MANY_REQUESTS',
            );
        },
    });

    app.use(cookieParser());
    app.use(limiter);
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(trimRequest);
    app.use(helmet());
    app.use(morgan('common'));

    const allowedOrigins = [
        'http://localhost:5173',
        'https://eventify.solve.vn',
        'https://your-another-frontend.vercel.app',
    ];

    const corsOptions: cors.CorsOptions = {
        origin: (
            origin: string | undefined,
            callback: (err: Error | null, allow?: boolean) => void
        ) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Required for cookies with sameSite: 'none'
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
};

export default applyGlobalMiddleware;