import express from "express";
import { ImageDiscussionController } from "../controllers/imageDiscussion.controller";
import { authenticationToken } from "../middlewares/auth.middleware";
import { createImageSchema, updateImageSchema } from "../validation/discussionImage.validation";
import { validateRequest } from "../middlewares/validation.middleware";
import { checkImageAccess } from "../middlewares/checkImageAccess.middleware";

const router = express.Router();

// Tạo hình ảnh mới
router.post("/", authenticationToken, validateRequest(createImageSchema), ImageDiscussionController.createImage);

// Lấy danh sách hình ảnh theo reference_id
router.get("/:reference_id", authenticationToken, checkImageAccess, ImageDiscussionController.getImagesByReference);

// Lấy chi tiết hình ảnh
router.get("/:image_id/detail", authenticationToken, checkImageAccess, ImageDiscussionController.getImageById);

// Cập nhật hình ảnh
router.put("/:image_id", authenticationToken, checkImageAccess, validateRequest(updateImageSchema), ImageDiscussionController.updateImage);

// Khôi phục hình ảnh
router.patch("/:image_id/restore", authenticationToken, checkImageAccess, ImageDiscussionController.restoreImage);

// Soft delete hình ảnh theo ID
router.delete("/:image_id", authenticationToken, checkImageAccess, ImageDiscussionController.deleteImage);

export default router;