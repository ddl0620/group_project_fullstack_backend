import mongoose, { Schema, model } from "mongoose";
import { DiscussionReplyInterface } from "../interfaces/discussionReply.interfaces";

// Schema cho bình luận trong hệ thống Discussion
const DiscussionReplySchema = new Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussionPost", required: true },
    parent_reply_id: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussionReply", default: null },
    content: { type: String, required: true },
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Tham chiếu đến User
    images: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Thêm index để tối ưu truy vấn
DiscussionReplySchema.index({ post_id: 1 });
DiscussionReplySchema.index({ parent_reply_id: 1 });
DiscussionReplySchema.index({ creator_id: 1 });

export const DiscussionReplyModel = model<DiscussionReplyInterface>("DiscussionReply", DiscussionReplySchema);