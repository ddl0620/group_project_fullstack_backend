import mongoose, {Document} from "mongoose";

export interface IMessageSeen extends Document {
    message_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    seen_at: Date;
}