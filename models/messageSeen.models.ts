import mongoose, {Schema} from "mongoose";


const MessageSeenSchema = new Schema<IMessageSeen>({
    message_id: { type: mongoose.Types.ObjectId, ref: "Message", required: true },
    user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    seen_at: { type: Date, default: Date.now },
});

export const MessageSeenModel = mongoose.model<IMessageSeen>("MessageSeen", MessageSeenSchema);