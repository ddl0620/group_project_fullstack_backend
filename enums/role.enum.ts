/**
 * USER_ROLE Enum
 * 
 * This enum defines the authorization roles available within the application's
 * access control system. Each role represents a different permission level
 * that determines what actions and resources a user can access.
 * 
 * Used in: Authentication middleware, authorization checks, user management,
 * and access control throughout the application.
 * 
 * @enum {string}
 */
export enum USER_ROLE {
    USER = 'USER',
    ADMIN = 'ADMIN',
}
