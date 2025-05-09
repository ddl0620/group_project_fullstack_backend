import mongoose, { Document } from "mongoose";

/**
 * Interface for replies/comments in the discussion system
 * 
 * Represents a reply created by a user in response to a discussion post or another reply.
 * This interface extends Mongoose's Document type to enable direct use with Mongoose models
 * while providing type safety for comment-related operations.
 */

// Interface cho bình luận trong hệ thống Discussion
export interface DiscussionReplyInterface extends Document {
    post_id: mongoose.Schema.Types.ObjectId | string; // ID bài viết mà bình luận thuộc về
    creator_id: mongoose.Schema.Types.ObjectId | string; // ID người tạo bình luận
    parent_reply_id: mongoose.Schema.Types.ObjectId | null; // Có thể là ObjectId hoặc null
    content: string; // Nội dung bình luận
    images?: string[]; // Mảng URL hình ảnh
    isDeleted: boolean; // Soft delete
    created_at?: Date; // Thời gian tạo bình luận
    updated_at?: Date; // Thời gian cập nhật bình luận
}