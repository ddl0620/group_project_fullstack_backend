// realtime/message/message.socket.ts

import { Server, Socket } from 'socket.io';
import {MessageHandler} from "./message/message.handler";

/**
 * Sets up WebSocket event handlers for real-time messaging functionality.
 * 
 * This function configures Socket.IO to handle various messaging events including
 * joining/leaving event rooms, typing indicators, sending messages, and handling disconnections.
 * It delegates the actual business logic to the MessageHandler class.
 * 
 * @param io - The Socket.IO server instance that manages all socket connections
 */
export default function messageSocket(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        /**
         * Event: join_event
         * Handles a user joining a specific event's messaging room
         * 
         * @param data.event_id - ID of the event to join
         * @param data.user_id - ID of the user joining the event
         */
        socket.on('join_event', async (data: { event_id: string; user_id: string }) => {
            try {
                await MessageHandler.handleJoinEvent(socket, data);
            } catch (err) {
                console.error('Error joining event:', err);
                socket.emit('error', { message: err || 'Failed to join event' });
            }
        });

        /**
         * Event: leave_event
         * Handles a user leaving a specific event's messaging room
         * 
         * @param event_id - ID of the event to leave
         */
        socket.on('leave_event', (event_id: string) => {
            try {
                MessageHandler.handleLeaveEvent(socket, event_id);
            } catch (err) {
                console.error('Error leaving event:', err);
                socket.emit('error', { message: err || 'Failed to leave event' });
            }
        });

        /**
         * Event: typing
         * Broadcasts a typing indicator to other users in the same event room
         * 
         * @param event_id - ID of the event where the user is typing
         */
        socket.on('typing', (event_id: string) => {
            try {
                MessageHandler.handleTyping(socket, event_id);
            } catch (err) {
                console.error('Error handling typing:', err);
                socket.emit('error', { message: err || 'Failed to handle typing' });
            }
        });

        /**
         * Event: send_message
         * Processes and broadcasts a new message to all users in an event room
         * 
         * @param data - Message data containing at minimum event_id and message content
         *               (Full structure defined in MessageHandler implementation)
         */
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

         /**
         * Event: disconnect
         * Cleans up resources and notifies other users when a socket disconnects
         */
        socket.on('disconnect', () => {
            try {
                MessageHandler.handleDisconnect(socket, io);
            } catch (err) {
                console.error('Error handling disconnect:', err);
            }
        });
    });
}