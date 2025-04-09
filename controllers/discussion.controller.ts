import { Request, Response } from 'express';
import Message from '../models/message.models';
import MessageSeen from '../models/messageSeen.models';
import EventUser from '../models/eventUser.models';
import User from '../models/user.models';
import { Server } from 'socket.io';

interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
    };
}

// Socket.IO instance
let io: Server;

// Function to set the Socket.IO instance
export const setSocketIOInstance = (socketIOInstance: Server) => {
    io = socketIOInstance;
};

// Send a message in an event chat
export const sendMessage = async (req: AuthenticationRequest, res: Response) => {
    try {
        const { eventId, content } = req.body;
        const senderId = req.user?.userId;

        if (!senderId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if the user is part of the event (attendee or organizer)
        const isParticipant = await EventUser.findOne({ event_id: eventId, attendee_id: senderId });
        if (!isParticipant) {
            return res.status(403).json({ error: 'You are not a participant of this event' });
        }

        // Create the message
        const message = await Message.create({
            event_id: eventId,
            sender_id: senderId,
            content,
            send_at: new Date(),
        });

        // Emit the message to the event room
        io.to(eventId).emit('newMessage', {
            eventId,
            messageId: message._id, // Include the message ID
            senderId,
            content,
            send_at: message.send_at,
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message,
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get all messages for an event
export const getMessagesByEvent = async (req: AuthenticationRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if the user is part of the event (attendee or organizer)
        const isParticipant = await EventUser.findOne({ event_id: eventId, attendee_id: userId });
        if (!isParticipant) {
            return res.status(403).json({ error: 'You are not a participant of this event' });
        }

        // Fetch messages for the event
        const messages = await Message.find({ event_id: eventId })
            .populate('sender_id', 'username email') // Populate sender details
            .sort({ send_at: 1 }); // Sort by send time (oldest to newest)

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Mark messages as seen
export const markMessagesAsSeen = async (req: AuthenticationRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Update or create a MessageSeen record
        const messageSeen = await MessageSeen.findOneAndUpdate(
            { event_id: eventId, user_id: userId },
            { seen_at: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Messages marked as seen',
            data: messageSeen,
        });
    } catch (error) {
        console.error('Error marking messages as seen:', error);
        res.status(500).json({ error: 'Failed to mark messages as seen' });
    }
};

// Mark a message as seen
export const markMessageAsSeen = async (req: AuthenticationRequest, res: Response) => {
    try {
        const { messageId } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if the user has already seen the message
        const existingRecord = await MessageSeen.findOne({ message_id: messageId, user_id: userId });
        if (!existingRecord) {
            // Create a new record
            await MessageSeen.create({
                message_id: messageId,
                user_id: userId,
                seen_at: new Date(),
            });
        }

        // Fetch the list of users who have seen the message
        const seenUsers = await MessageSeen.find({ message_id: messageId }).populate('user_id', 'username');

        // Emit the updated seen list to the room
        io.to(messageId).emit('messageSeen', {
            messageId,
            seenUsers,
        });

        res.status(200).json({
            success: true,
            message: 'Message marked as seen',
            data: seenUsers,
        });
    } catch (error) {
        console.error('Error marking message as seen:', error);
        res.status(500).json({ error: 'Failed to mark message as seen' });
    }
};
