import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import trimRequest from './requestTrimming';
import rateLimit from 'express-rate-limit';
import { HttpError } from '../helpers/httpsError.helpers';
import app from '../app';

/**
 * Configures and applies global middleware to the Express application.
 *
 * This function sets up essential middleware for security, parsing, logging,
 * and request handling in a standardized way across the application.
 *
 * @param app - The Express application instance
 */
const applyGlobalMiddleware = (app: express.Express) => {
    /**
     * Rate limiting configuration
     *
     * Protects against brute force attacks and prevents API abuse by limiting
     * the number of requests from a single IP address within a time window.
     */
    const limiter = rateLimit({
        windowMs: 2 * 60 * 1000, // 15 minutes
        limit: 300, // Limit each IP to 10 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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
    app.use(cookieParser());
    app.use(trimRequest);
    app.use(helmet());
    app.use(morgan('common'));

    const allowedOrigins = [
        'http://localhost:5173',
        'https://eventify.solve.vn',
        'https://your-another-frontend.vercel.app',
    ];

    const corsOptions = {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions)); // 👈 Xử lý preflight bằng cùng config
};

export default applyGlobalMiddleware;
