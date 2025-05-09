import mongoose, { Schema, model } from "mongoose";
import { DiscussionPostInterface } from "../interfaces/discussionPost.interfaces";

/**
 * Mongoose schema for discussion posts.
 * 
 * This schema defines the structure for discussion post documents in MongoDB,
 * representing user-created posts within event discussions. Each post belongs to
 * a specific event and can include text content and optional images.
 */
// Schema cho bài viết trong hệ thống Discussion
const DiscussionPostSchema = new Schema<DiscussionPostInterface>({
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Người tạo bài viết
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }, // Sự kiện liên quan
    content: { type: String, required: true }, // Nội dung bài viết
    images: [{ type: String }], // Danh sách URL hình ảnh
    isDeleted: { type: Boolean, default: false }, // Soft delete
    created_at: { type: Date, default: Date.now }, // Thời gian tạo
    updated_at: { type: Date, default: Date.now }, // Thời gian cập nhật
});

// Thêm index để tối ưu truy vấn
DiscussionPostSchema.index({ event_id: 1 });
DiscussionPostSchema.index({ creator_id: 1 });

/**
 * Mongoose model for discussion post documents.
 * 
 * This model provides an interface for creating, querying, updating, and
 * deleting discussion post documents in the MongoDB 'DiscussionPost' collection.
 */
export const DiscussionPostModel = model<DiscussionPostInterface>("DiscussionPost", DiscussionPostSchema);