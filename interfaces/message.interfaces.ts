import mongoose, {Document} from "mongoose";

export interface IMessage extends Document {
    content: string;
    send_at: Date;
    event_id: mongoose.Types.ObjectId;
    sender_id: mongoose.Types.ObjectId;
}
