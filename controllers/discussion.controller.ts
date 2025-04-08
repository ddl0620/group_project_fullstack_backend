import { Request, Response } from 'express';
import Message from '../models/message.models';
interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
    };
}

export const sendMessage = async (req: AuthenticationRequest, res: Response) => {
    try {
    const { eventId, content } = req.body;
    const sender = req.user?.userId;

    const message = await Message.create({ eventId, sender, content });
    res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi gửi tin nhắn' });
    }
};

export const getMessagesByEvent = async (req: Request, res: Response) => {
    try {
    const { eventId } = req.params;
    const messages = await Message.find({ eventId })
    .populate('sender', 'username email')
    .sort({ timestamp: 1 });

    res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách tin nhắn' });
    }
};
