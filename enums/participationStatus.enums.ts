/**
 * ParticipationStatus Enum
 *
 * This enum defines the possible states of a user's participation status for an event.
 * It tracks the lifecycle of an invitation or participation request from initial state
 * through to final resolution (acceptance or denial).
 *
 * Used in: Event invitations, RSVP tracking, participation requests, and attendance reporting.
 *
 * @enum {string}
 */
export enum ParticipationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DENIED = 'DENIED',
    INVITED = 'INVITED',
}
