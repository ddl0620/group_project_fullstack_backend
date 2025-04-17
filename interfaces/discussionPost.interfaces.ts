import mongoose, { Document } from "mongoose";

// Interface cho bài viết trong hệ thống Discussion
export interface DiscussionPostInterface extends Document {
    creator_id: mongoose.Schema.Types.ObjectId | string; // Người tạo bài viết
    event_id: mongoose.Schema.Types.ObjectId | string; // Sự kiện liên quan
    content: string; // Nội dung bài viết
    images?: string[]; // Danh sách URL hình ảnh
    isDeleted: boolean; // Soft delete
    created_at?: Date; // Thời gian tạo bài viết
    updated_at?: Date; // Thời gian cập nhật bài viết
}