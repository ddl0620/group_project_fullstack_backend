import { ParticipationStatus} from "../enums/participationStatus.enums";

export interface ParticipantInterface extends Document {
    userId: object;
    status: ParticipationStatus;
    invitedAt: Date;
    respondedAt: Date | null;
}