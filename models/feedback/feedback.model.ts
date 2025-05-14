import mongoose, { Schema } from 'mongoose';
import { FeedbackInterfaces } from '../../interfaces/feedback/feedback.interfaces';
import { RatingInterfaces } from '../../interfaces/feedback/rating.interfaces';

const ratingSchema = new Schema<RatingInterfaces>({
    overall: { type: Number, required: true, min: 1, max: 10 },
    ui: { type: Number, required: true, min: 1, max: 10 },
    ux: { type: Number, required: true, min: 1, max: 10 },
});

const feedbackSchema = new Schema<FeedbackInterfaces>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: ratingSchema, required: true },
    feedback: { type: String, optional: true, default: '' },
    role: { type: String, required: true },
    university: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const FeedbackModel = mongoose.model<FeedbackInterfaces>('Feedback', feedbackSchema);
