import mongoose, { Schema, model } from "mongoose";

const ImageDiscussionSchema = new Schema({
    url: { type: String, required: true }, // URL của hình ảnh
    type: { type: String, enum: ["post", "reply"], required: true }, // Loại hình ảnh (post hoặc reply)
    reference_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID của bài viết hoặc bình luận
    uploaded_at: { type: Date, default: Date.now }, // Ngày tải lên
});

// Thêm index
ImageDiscussionSchema.index({ reference_id: 1 }); // Index cho reference_id
ImageDiscussionSchema.index({ type: 1, reference_id: 1 }); // Kết hợp type và reference_id

export const ImageModel = model("Image", ImageDiscussionSchema);