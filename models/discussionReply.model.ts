import mongoose, { Schema, model } from "mongoose";
import { DiscussionReplyInterface } from "../interfaces/discussionReply.interfaces";

/**
 * Mongoose schema for discussion replies.
 * 
 * This schema defines the structure for reply documents in MongoDB,
 * representing comments on discussion posts or replies to other comments.
 * The schema supports a nested comment structure through parent-child relationships.
 */
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

/**
 * Mongoose model for discussion reply documents.
 * 
 * This model provides an interface for creating, querying, updating, and
 * deleting reply documents in the MongoDB 'DiscussionReply' collection.
 */
export const DiscussionReplyModel = model<DiscussionReplyInterface>("DiscussionReply", DiscussionReplySchema);