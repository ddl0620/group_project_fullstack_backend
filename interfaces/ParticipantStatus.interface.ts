import {ParticipationStatus} from "../enums/participationStatus.enums";

export interface IParticipantStatus {
    userId: string;
    status: ParticipationStatus;
    invitedAt: Date;
    respondedAt?: Date;
}
