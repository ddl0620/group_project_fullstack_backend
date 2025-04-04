export enum ParticipationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DENIED = 'DENIED'
}

export interface IParticipantStatus {
    userId: string;
    status: ParticipationStatus;
    invitedAt: Date;
    respondedAt?: Date;
}
