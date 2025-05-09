import mongoose, { Schema, model } from "mongoose";
import { ImageDiscussionInterface } from "../interfaces/imageDiscussion.interfaces";

/**
 * Mongoose schema for discussion images.
 * 
 * This schema defines the structure for image documents in MongoDB,
 * representing images that can be attached to discussion posts or replies.
 * It provides a centralized way to manage and reference images across the discussion system.
 */
// Schema cho hình ảnh trong hệ thống Discussion
const ImageDiscussionSchema = new Schema<ImageDiscussionInterface>({
    url: { type: String, required: true }, // URL của hình ảnh
    type: { type: String, enum: ["post", "reply"], required: true }, // Loại hình ảnh (post hoặc reply)
    reference_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID của bài viết hoặc bình luận
    uploaded_at: { type: Date, default: Date.now }, // Ngày tải lên
    isDeleted: { type: Boolean, default: false }, // Soft delete
});

// Thêm index để tối ưu truy vấn
ImageDiscussionSchema.index({ reference_id: 1 });
ImageDiscussionSchema.index({ type: 1, reference_id: 1 });

/**
 * Mongoose model for discussion image documents.
 * 
 * This model provides an interface for creating, querying, updating, and
 * deleting image documents in the MongoDB 'Image' collection.
 * 
 * Note: There appears to be a typo in the model name (ImageDicussionModel)
 * which should be corrected to ImageDiscussionModel for consistency.
 */
export const ImageDicussionModel = model<ImageDiscussionInterface>("Image", ImageDiscussionSchema);