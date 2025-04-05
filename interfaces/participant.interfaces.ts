import { ParticipationStatus} from "../enums/participationStatus.enums";

export interface IParticipantStatus extends Document {
    userId: string;
    status: ParticipationStatus;
    invitedAt: Date;
    respondedAt: Date;
}