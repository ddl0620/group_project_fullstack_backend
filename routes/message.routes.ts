import express from "express";
import {
    getMessagesByEvent,
    createMessage,
    markMessageAsSeen,
} from "../controllers/message.controllers";
import {authenticationToken} from "../middlewares/auth.middleware";

const router = express.Router();

// Lấy danh sách tin nhắn của một event
router.get("/:eventId", authenticationToken, getMessagesByEvent);

// Gửi tin nhắn
router.post("/", authenticationToken, createMessage);

// Đánh dấu tin nhắn đã xem
router.post("/mark-as-seen", authenticationToken, markMessageAsSeen);

export default router;
