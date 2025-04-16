import mongoose, { Schema, model } from "mongoose";
import { DiscussionPostInterface } from "../interfaces/discussionPost.interface";

const DiscussionPostSchema = new Schema<DiscussionPostInterface>({
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    created_at: { type: Date, default: Date.now },
    content: { type: String, required: true },
    images: [{ type: String }],
});

DiscussionPostSchema.index({ event_id: 1 });
DiscussionPostSchema.index({ creator_id: 1 });

export const DiscussionPostModel = model<DiscussionPostInterface>("DiscussionPost", DiscussionPostSchema);