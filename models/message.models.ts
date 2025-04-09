import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    event_id: mongoose.Types.ObjectId;
    sender_id: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
}

const messageSchema: Schema = new Schema({
    event_id: { type: Schema.Types.ObjectId, ref: 'event', required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    timestamp: { type: Date, default: Date.now },
});

// Add indexes for optimized queries
messageSchema.index({ event_id: 1, timestamp: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);