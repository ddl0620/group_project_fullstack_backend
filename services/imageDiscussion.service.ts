import { ImageModel } from "../models/imageDiscussion.model";
import { ImageDiscussionInterface } from "../interfaces/ImageDiscussion.interfaces";

export class ImageDiscussionService {
    // Tạo hình ảnh mới
    static async createImage(data: ImageDiscussionInterface): Promise<ImageDiscussionInterface> {
        return await ImageModel.create(data);
    }

    // Lấy danh sách hình ảnh theo reference_id (bài viết hoặc bình luận)
    static async getImagesByReference(reference_id: string, type: "post" | "reply"): Promise<ImageDiscussionInterface[]> {
        return await ImageModel.find({ reference_id, type }).sort({ uploaded_at: -1 });
    }

    // Xóa hình ảnh theo ID
    static async deleteImage(image_id: string): Promise<ImageDiscussionInterface | null> {
        return await ImageModel.findByIdAndDelete(image_id);
    }
}