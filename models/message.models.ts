import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    eventId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
}

const messageSchema: Schema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'event', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>('Message', messageSchema);
