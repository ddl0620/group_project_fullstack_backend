import { Request, Response } from "express";
import MessageService from "../services/message.service";
import { Server } from "socket.io";

let io: Server; // Socket.IO instance

export const setSocketIOInstance = (socketIOInstance: Server) => {
    io = socketIOInstance;
};

// Lấy danh sách tin nhắn của một event
export const getMessagesByEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const messages = await MessageService.getMessagesByEvent(eventId);
    res.json(messages);
};

// Gửi tin nhắn
export const createMessage = async (req: Request, res: Response) => {
    const { content, event_id, sender_id } = req.body;
    const message = await MessageService.createMessage(content, event_id, sender_id);

    // Phát tin nhắn mới tới tất cả người dùng trong event
    io.to(event_id).emit("new_message", message);

    res.json(message);
};

// Đánh dấu tin nhắn đã xem
export const markMessageAsSeen = async (req: Request, res: Response) => {
    const { message_id, user_id } = req.body;
    const seenUsers = await MessageService.markMessageAsSeen(message_id, user_id);

    // Phát danh sách người đã xem tới tất cả người dùng
    io.to(message_id).emit("message_seen", { message_id, seenUsers });

    res.json(seenUsers);
};
