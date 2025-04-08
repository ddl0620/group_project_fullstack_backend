import { ParticipationStatus} from "../enums/participationStatus.enums";

export interface IParticipantStatus extends Document {
    userId: object;
    status: ParticipationStatus;
    invitedAt: Date;
    respondedAt: Date;
}