import mongoose, {Schema} from "mongoose";
import { IMessageSeen } from "../interfaces/messageSeen.interfaces";

const MessageSeenSchema = new Schema<IMessageSeen>({
    message_id: { type: mongoose.Types.ObjectId, ref: "message", required: true },
    user_id: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    seen_at: { type: Date, default: Date.now },
});

export const MessageSeenModel = mongoose.model<IMessageSeen>("MessageSeen", MessageSeenSchema);