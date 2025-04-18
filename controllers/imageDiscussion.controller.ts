import { Response, NextFunction } from "express";
import { ImageDiscussionService } from "../services/imageDiscussion.service";
import { HttpResponse } from "../helpers/HttpResponse";
import { ImageDicussionModel } from "../models/imageDiscussion.model";
import { HttpError } from "../helpers/httpsError.helpers";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";

export class ImageDiscussionController {
    // Tạo hình ảnh mới
    static async createImage(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { url, type, reference_id } = req.body;

            const image = await ImageDiscussionService.createImage({ url, type, reference_id });

            HttpResponse.sendYES(res, 201, "Image created successfully", { image });
        } catch (err) {
            next(err);
        }
    }

    // Lấy danh sách hình ảnh theo reference_id
    static async getImagesByReference(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reference_id } = req.params;
            const { type } = req.query;

            const images = await ImageDiscussionService.getImagesByReference(reference_id, type as "post" | "reply");

            HttpResponse.sendYES(res, 200, "Images fetched successfully", { images });
        } catch (err) {
            next(err);
        }
    }

    // Soft delete hình ảnh theo ID
    static async deleteImage(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { image_id } = req.params;

            const image = await ImageDiscussionService.deleteImage(image_id);

            HttpResponse.sendYES(res, 200, "Image deleted successfully", { image });
        } catch (err) {
            next(err);
        }
    }

    // Cập nhật hình ảnh
    static async updateImage(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { image_id } = req.params;
            const updates = req.body;

            const updatedImage = await ImageDicussionModel.findByIdAndUpdate(image_id, updates, { new: true });
            if (!updatedImage) {
                throw new HttpError("Image not found", 404, "IMAGE_NOT_FOUND");
            }

            res.status(200).json({ success: true, data: updatedImage });
        } catch (err) {
            const error = err as Error; // Ép kiểu err thành Error
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Khôi phục hình ảnh
    static async restoreImage(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { image_id } = req.params;

            const restoredImage = await ImageDicussionModel.findByIdAndUpdate(image_id, { isDeleted: false }, { new: true });
            if (!restoredImage) {
                throw new HttpError("Image not found", 404, "IMAGE_NOT_FOUND");
            }

            res.status(200).json({ success: true, data: restoredImage });
        } catch (err) {
            const error = err as Error; // Ép kiểu err thành Error
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    // Lấy chi tiết hình ảnh
    static async getImageById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { image_id } = req.params;

            const image = await ImageDicussionModel.findById(image_id);
            if (!image) {
                throw new HttpError("Image not found", 404, "IMAGE_NOT_FOUND");
            }

            res.status(200).json({ success: true, data: image });
        } catch (err) {
            const error = err as Error; // Ép kiểu err thành Error
            res.status(500).json({ success: false, message: error.message });
        }
    }
}