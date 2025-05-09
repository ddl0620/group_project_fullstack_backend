/**
 * NotificationType Enum
 * 
 * This enum defines the various types of notifications that can be generated within the application.
 * It provides a standardized set of notification categories that are used for user alerts,
 * activity tracking, and notification management throughout the system.
 * 
 * @enum {string}
 */
export enum NotificationType {
    INVITATION = 'INVITATION',
    RSVP_ACCEPT = 'RSVP_ACCEPT',
    RSVP_DENIED = 'RSVP_DENIED',
    REQUEST_JOIN = 'REQUEST_JOIN',
    REQUEST_ACCEPT = 'REQUEST_ACCEPT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    REPLY = 'REPLY',
    COMMENT = 'COMMENT',
    NEW_POST = 'NEW_POST',
    UPDATE_EVENT = 'UPDATE_EVENT',
    DELETE_EVENT = 'DELETE_EVENT',
}
