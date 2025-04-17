import mongoose, { Schema, model } from "mongoose";
import { DiscussionReplyInterface } from "../interfaces/discussionReply.interfaces";

// Schema cho bình luận trong hệ thống Discussion
const DiscussionReplySchema = new Schema<DiscussionReplyInterface>({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussionPost", required: true }, // Bài viết liên quan
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Người tạo bình luận
    parent_reply_id: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussionReply", default: null }, // Bình luận cha (nếu có)
    content: { type: String, required: true }, // Nội dung bình luận
    images: [{ type: String }], // Danh sách URL hình ảnh
    isDeleted: { type: Boolean, default: false }, // Soft delete
    created_at: { type: Date, default: Date.now }, // Thời gian tạo bình luận
    updated_at: { type: Date, default: Date.now }, // Thời gian cập nhật bình luận
});

// Thêm index để tối ưu truy vấn
DiscussionReplySchema.index({ post_id: 1 });
DiscussionReplySchema.index({ parent_reply_id: 1 });
DiscussionReplySchema.index({ creator_id: 1 });

export const DiscussionReplyModel = model<DiscussionReplyInterface>("DiscussionReply", DiscussionReplySchema);