import mongoose, { Schema} from "mongoose";

const MessageSchema = new Schema<IMessage>({
    content: { type: String, required: true },
    send_at: { type: Date, default: Date.now },
    event_id: { type: mongoose.Types.ObjectId, ref: "event", required: true },
    sender_id: { type: mongoose.Types.ObjectId, ref: "user", required: true },
});

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);