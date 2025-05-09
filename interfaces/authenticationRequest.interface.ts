import { Request } from 'express';
import {USER_ROLE} from "../enums/role.enum";

/**
 * Extended Express Request interface with authentication information
 * 
 * This interface extends the standard Express Request to include user authentication
 * data that is typically added by authentication middleware. It provides type safety
 * for accessing user identity and role information in route handlers.
 */
export interface AuthenticationRequest extends Request {
    /**
     * User authentication data attached by auth middleware
     * 
     * This optional property contains the authenticated user's information.
     * It will be undefined for unauthenticated requests.
     */
    user?: {
        userId: string;
        role?: USER_ROLE; // Thêm userRole
    };
    // files?: Express.Multer.File[]; // Thêm files để hỗ trợ upload file

}
