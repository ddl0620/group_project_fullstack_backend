import mongoose, { Document } from "mongoose";

export interface DiscussionReplyInterface extends Document {
    post_id: mongoose.Schema.Types.ObjectId | string; // ID bài viết mà bình luận thuộc về
    creator_id: mongoose.Schema.Types.ObjectId | string; // ID người tạo bình luận
    parent_reply_id?: mongoose.Schema.Types.ObjectId | string; // ID bình luận cha (nếu có)
    content: string; // Nội dung bình luận
    images?: string[]; // Mảng URL hình ảnh
    created_at?: Date; // Thời gian tạo bình luận
}