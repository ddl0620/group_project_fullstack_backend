import express from "express";
import {
    getMessagesByEvent,
    createMessage,
    markMessageAsSeen,
} from "../controllers/message.controllers";

const router = express.Router();

// Lấy danh sách tin nhắn của một event
router.get("/:eventId", getMessagesByEvent);

// Gửi tin nhắn
router.post("/", createMessage);

// Đánh dấu tin nhắn đã xem
router.post("/mark-as-seen", markMessageAsSeen);

export default router;
