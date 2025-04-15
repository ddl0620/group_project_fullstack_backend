import  {Document} from "mongoose";

export interface IMessage extends Document {
    content: string;
    send_at: Date;
    event_id: object;
    sender_id: object;
}
