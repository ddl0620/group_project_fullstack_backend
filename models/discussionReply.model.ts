import mongoose, { Schema, model } from "mongoose";
import { DiscussionReplyInterface } from "../interfaces/discussionReply.interface";

const DiscussionReplySchema = new Schema<DiscussionReplyInterface>({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussionPost", required: true },
    parent_reply_id: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussionReply", default: null },
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    created_at: { type: Date, default: Date.now },
    content: { type: String, required: true },
    images: [{ type: String }],
});

DiscussionReplySchema.index({ post_id: 1 });
DiscussionReplySchema.index({ parent_reply_id: 1 });
DiscussionReplySchema.index({ creator_id: 1 });

export const DiscussionReplyModel = model<DiscussionReplyInterface>("DiscussionReply", DiscussionReplySchema);