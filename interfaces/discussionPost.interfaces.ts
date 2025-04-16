import mongoose, { Document } from "mongoose";

export interface DiscussionPostInterface extends Document {
    content: string; // Nội dung bài viết
    creator_id: mongoose.Schema.Types.ObjectId | string; // ID người tạo bài viết
    event_id: mongoose.Schema.Types.ObjectId | string; // ID event mà bài viết thuộc về
    images?: string[]; // Mảng URL hình ảnh
    created_at?: Date; // Thời gian tạo bài viết
}