import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageSeen extends Document {
    message_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    seen_at: Date;
}

const messageSeenSchema: Schema = new Schema({
    message_id: { type: mongoose.Types.ObjectId, ref: 'Message', required: true },
    user_id: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    seen_at: { type: Date, default: Date.now },
});

// Add indexes for optimized queries
messageSeenSchema.index({ message_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model<IMessageSeen>('MessageSeen', messageSeenSchema);