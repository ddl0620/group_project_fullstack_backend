import { MessageModel } from "../models/message.models";
import { MessageSeenModel } from "../models/messageSeen.models";

const getMessagesByEvent = async (eventId: string) => {
    return MessageModel.find({ event_id: eventId })
        .populate("sender_id", "name email")
        .sort({ send_at: 1 });
};

const createMessage = async (content: string, event_id: string, sender_id: string) => {
    return MessageModel.create({ content, event_id, sender_id, send_at: new Date() });
};

const markMessageAsSeen = async (message_id: string, user_id: string) => {
    const existingRecord = await MessageSeenModel.findOne({ message_id, user_id });
    if (!existingRecord) {
        await MessageSeenModel.create({ message_id, user_id, seen_at: new Date() });
    }
    return MessageSeenModel.find({ message_id }).populate("user_id", "name");
};

export default { getMessagesByEvent, createMessage, markMessageAsSeen };
