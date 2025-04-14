import  {Document} from "mongoose";

export interface IMessageSeen extends Document {
    message_id: object;
    user_id: object;
    seen_at: Date;
}