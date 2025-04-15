// realtime/message/message.handler.ts

import {Server, Socket} from 'socket.io';
import mongoose from 'mongoose';
import MessageService from '../../services/message.service';
import { EventModel } from '../../models/event.models';
import { SendMessageInput } from '../../types/message.type';

// Định nghĩa kiểu dữ liệu cho socket data
// interface SocketData {
//     userId: string;
//     eventId?: string;
// }

export class MessageHandler {
    static async handleJoinEvent(socket: Socket, data: { event_id: string; user_id: string }) {
        const { event_id, user_id } = data;

        if (!mongoose.Types.ObjectId.isValid(event_id)) {
            socket.emit('error', { message: 'Invalid event ID format' });
            return;
        }
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            socket.emit('error', { message: 'Invalid user ID format' });
            return;
        }

        const event = await EventModel.findById(event_id);
        if (!event) {
            socket.emit('error', { message: 'Event not found' });
            return;
        }

        const isParticipant =
            event.participants &&
            event.participants.some(
                (participant) =>
                    participant.userId && participant.userId.toString() === user_id
            );
        const isOrganizer =
            event.organizer && event.organizer.toString() === user_id;

        if (!isParticipant && !isOrganizer) {
            socket.emit('error', {
                message: 'You are not a participant of this event',
            });
            return;
        }

        socket.join(event_id);
        socket.data = { userId: user_id, eventId: event_id };
        console.log(`Socket ${socket.id} joined event ${event_id}`);

        socket.to(event_id).emit('user_joined', { user_id });
        socket.emit('joined_event', event_id);
    }

    static handleLeaveEvent(socket: Socket, event_id: string) {
        socket.leave(event_id);
        console.log(`Socket ${socket.id} left event ${event_id}`);

        socket.to(event_id).emit('user_left', { user_id: socket.data?.userId });
        socket.data = { userId: socket.data?.userId };
    }

    static handleTyping(socket: Socket, event_id: string) {
        socket.to(event_id).emit('user_typing', { user_id: socket.data?.userId });
    }

    static async handleSendMessage(socket: Socket, io: Server, data: SendMessageInput) {
        const { content, event_id, sender_id } = data;

        console.log('Received send_message event with data:', data);

        if (!mongoose.Types.ObjectId.isValid(sender_id)) {
            console.error('Invalid sender_id:', sender_id);
            socket.emit('error', { message: 'Invalid sender_id' });
            return;
        }

        const currentEventId = socket.data?.eventId;
        if (currentEventId !== event_id) {
            socket.emit('error', { message: 'You must join the event room first' });
            return;
        }

        const message = await MessageService.createMessage({
            content,
            event_id,
            sender_id,
        });

        console.log('Message saved to database:', message);

        io.to(event_id).emit('new_message', message);

        console.log(`Message emitted to all users in event ${event_id}`);
    }

    static handleDisconnect(socket: Socket, io: Server) {
        const eventId = socket.data?.eventId;
        if (eventId) {
            io.to(eventId).emit('user_left', { user_id: socket.data?.userId });
        }
        console.log('User disconnected:', socket.id);
    }
}