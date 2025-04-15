// realtime/message/message.socket.ts

import { Server, Socket } from 'socket.io';
import {MessageHandler} from "./message/message.handler";

export default function messageSocket(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('join_event', async (data: { event_id: string; user_id: string }) => {
            try {
                await MessageHandler.handleJoinEvent(socket, data);
            } catch (err) {
                console.error('Error joining event:', err);
                socket.emit('error', { message: err || 'Failed to join event' });
            }
        });

        socket.on('leave_event', (event_id: string) => {
            try {
                MessageHandler.handleLeaveEvent(socket, event_id);
            } catch (err) {
                console.error('Error leaving event:', err);
                socket.emit('error', { message: err || 'Failed to leave event' });
            }
        });

        socket.on('typing', (event_id: string) => {
            try {
                MessageHandler.handleTyping(socket, event_id);
            } catch (err) {
                console.error('Error handling typing:', err);
                socket.emit('error', { message: err || 'Failed to handle typing' });
            }
        });

        socket.on('send_message', async (data) => {
            try {
                await MessageHandler.handleSendMessage(socket, io, data);
            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('error', {
                    message: err || 'Failed to send message',
                });
            }
        });

        socket.on('disconnect', () => {
            try {
                MessageHandler.handleDisconnect(socket, io);
            } catch (err) {
                console.error('Error handling disconnect:', err);
            }
        });
    });
}