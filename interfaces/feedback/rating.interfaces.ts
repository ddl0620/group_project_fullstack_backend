import { Document } from 'mongoose';
/**
 * Interface for user accounts in the system
 *
 * Represents a user profile with authentication information, personal details,
 * and system limitations. This interface extends Mongoose's Document type to enable
 * direct use with Mongoose models while providing type safety for user-related operations.
 *
 * Note: CRUD operations are handled in UserServices rather than being declared here.
 */
export interface RatingInterfaces extends Document {
    overall: number;
    ui: number;
    ux: number;
}
