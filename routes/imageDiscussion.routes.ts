import express from "express";
import { ImageDiscussionController } from "../controllers/imageDiscussion.controller";
import { authenticationToken } from "../middlewares/auth.middleware";
import { createImageSchema } from "../validation/discussionImage.validation";
import { validateRequest } from "../middlewares/validation.middleware";

const router = express.Router();

// Tạo hình ảnh mới
router.post("/", authenticationToken, validateRequest(createImageSchema), ImageDiscussionController.createImage);

// Lấy danh sách hình ảnh theo reference_id
router.get("/:reference_id", authenticationToken, ImageDiscussionController.getImagesByReference);

// Soft delete hình ảnh theo ID
router.delete("/:image_id", authenticationToken, ImageDiscussionController.deleteImage);

export default router;