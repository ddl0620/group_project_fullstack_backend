import express, { CookieOptions } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import trimRequest from './requestTrimming';
import rateLimit from 'express-rate-limit';
import { HttpError } from '../helpers/httpsError.helpers';

export const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'lax' | 'none',
    maxAge: 24 * 60 * 60 * 1000,
};

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

    app.use(
        cors({
            origin: (origin, callback) => {
                const allowedOrigins = [
                    'http://localhost:5173',
                    'http://localhost:5174',
                    'https://eventify.solve.vn',
                    'https://your-another-frontend.vercel.app',
                ];

                // if (!origin || allowedOrigins.includes(origin)) {
                //     callback(null, true);
                // } else {
                //     callback(new Error('Not allowed by CORS'));
                // }

                if (allowedOrigins.includes(<string>origin) || !origin) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        }),
    );
};

export default applyGlobalMiddleware;
