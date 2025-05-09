import { ParticipationStatus} from "../enums/participationStatus.enums";

/**
 * Interface for event participants in the system
 * 
 * Represents a user's relationship to an event, including their participation status
 * and relevant timestamps. This interface extends Mongoose's Document type to enable
 * direct use with Mongoose models while providing type safety for participant-related operations.
 */
export interface ParticipantInterface extends Document {
    userId: object;
    status: ParticipationStatus;
    invitedAt: Date;
    respondedAt: Date | null;
    isDeleted: boolean;
}