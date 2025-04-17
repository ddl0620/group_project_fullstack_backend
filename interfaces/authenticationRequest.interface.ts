import { Request } from 'express';
import {USER_ROLE} from "../enums/role.enum";

export interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
        role?: USER_ROLE; // Thêm userRole
    };
}
