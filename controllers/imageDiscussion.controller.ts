import { Request, Response, NextFunction } from "express";
import { ImageDiscussionService } from "../services/imageDiscussion.service";
import { HttpResponse } from "../helpers/HttpResponse";

export class ImageDiscussionController {
    // Tạo hình ảnh mới
    static async createImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { url, type, reference_id } = req.body;

            const image = await ImageDiscussionService.createImage({ url, type, reference_id });
            HttpResponse.sendYES(res, 201, "Image created successfully", { image });
        } catch (err) {
            next(err);
        }
    }

    // Lấy danh sách hình ảnh theo reference_id
    static async getImagesByReference(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    static async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { image_id } = req.params;

            const image = await ImageDiscussionService.deleteImage(image_id);

            // if (!image) {
            //     return HttpResponse.sendNO(res, 404, "Image not found");
            // }

            HttpResponse.sendYES(res, 200, "Image deleted successfully", { image });
        } catch (err) {
            next(err);
        }
    }
}