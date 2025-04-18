import mongoose, { Document } from "mongoose";

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