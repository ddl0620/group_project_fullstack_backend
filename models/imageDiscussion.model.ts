import mongoose, { Schema, model } from "mongoose";
import { ImageDiscussionInterface } from "../interfaces/imageDiscussion.interfaces";

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

export const ImageDicussionModel = model<ImageDiscussionInterface>("Image", ImageDiscussionSchema);