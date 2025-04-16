import express from "express";
import { ImageDiscussionController } from "../controllers/imageDiscussion.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Tạo hình ảnh mới
router.post("/", authenticationToken, ImageDiscussionController.createImage);

// Lấy danh sách hình ảnh theo reference_id
router.get("/:reference_id", authenticationToken, ImageDiscussionController.getImagesByReference);

// Xóa hình ảnh theo ID
router.delete("/:image_id", authenticationToken, ImageDiscussionController.deleteImage);

export default router;