import { Request } from 'express';

export interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}
