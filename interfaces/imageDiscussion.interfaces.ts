import mongoose, { Document } from "mongoose";

/**
 * Interface for images in the discussion system
 * 
 * Represents an image that can be attached to either a discussion post or a reply.
 * This interface extends Mongoose's Document type to enable direct use with Mongoose models
 * while providing type safety for image-related operations in the discussion system.
 */
// Interface cho hình ảnh trong hệ thống Discussion
export interface ImageDiscussionInterface extends Document {
    url: string; // URL của hình ảnh
    type: "post" | "reply"; // Loại hình ảnh (thuộc bài viết hoặc bình luận)
    reference_id: mongoose.Schema.Types.ObjectId | string; // ID của bài viết hoặc bình luận
    uploaded_at?: Date; // Thời gian tải lên (tự động thêm bởi Mongoose)
    isDeleted: boolean; // Soft delete
}