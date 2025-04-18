import { ImageDicussionModel } from "../models/imageDiscussion.model";
import { ImageDiscussionInterface } from "../interfaces/imageDiscussion.interfaces";
import { CreateImageInput } from "../types/discussionImage.type";

export class ImageDiscussionService {
    // Tạo hình ảnh mới
    static async createImage(data: CreateImageInput): Promise<ImageDiscussionInterface> {
        return await ImageDicussionModel.create(data);
    }

    // Lấy danh sách hình ảnh theo reference_id (bài viết hoặc bình luận)
    static async getImagesByReference(reference_id: string, type: "post" | "reply"): Promise<ImageDiscussionInterface[]> {
        return await ImageDicussionModel.find({ reference_id, type, isDeleted: false }).sort({ uploaded_at: -1 });
    }

    // Soft delete hình ảnh theo ID
    static async deleteImage(image_id: string): Promise<ImageDiscussionInterface | null> {
        return await ImageDicussionModel.findByIdAndUpdate(image_id, { isDeleted: true }, { new: true });
    }

    // Soft delete tất cả hình ảnh liên quan đến bài viết hoặc bình luận
    static async deleteImagesByReference(reference_id: string, type: "post" | "reply"): Promise<void> {
        await ImageDicussionModel.updateMany({ reference_id, type }, { isDeleted: true });
    }
}