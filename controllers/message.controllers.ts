// controllers/message.controllers.ts

import {Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import MessageService from '../services/message.service';
import { HttpError } from '../helpers/httpsError.helpers';
import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";

let io: Server;

export const setSocketIOInstance = (socketIOInstance: Server) => {
    io = socketIOInstance;
};

export const getMessagesByEvent = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            throw new HttpError('Authentication required', 401, 'AUTH_REQUIRED');
        }

        const messages = await MessageService.getMessagesByEvent(eventId, userId);
        res.status(200).json({
            success: true,
            message: 'Messages fetched successfully',
            data: messages,
        });
    } catch (err) {
        next(err);
    }
};

export const createMessage = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { content, event_id, sender_id } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            throw new HttpError('Authentication required', 401, 'AUTH_REQUIRED');
        }

        if (sender_id !== userId) {
            throw new HttpError(
                'You can only send messages as yourself',
                403,
                'FORBIDDEN'
            );
        }

        const message = await MessageService.createMessage({
            content,
            event_id,
            sender_id,
        });

        io.to(event_id).emit('new_message', message);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message,
        });
    } catch (err) {
        next(err);
    }
};

export const markMessageAsSeen = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { message_id, user_id } = req.body;
        const authenticatedUserId = req.user?.userId;

        if (!authenticatedUserId) {
            throw new HttpError('Authentication required', 401, 'AUTH_REQUIRED');
        }

        if (user_id !== authenticatedUserId) {
            throw new HttpError(
                'You can only mark messages as seen for yourself',
                403,
                'FORBIDDEN'
            );
        }

        const { seenUsers, eventId } = await MessageService.markMessageAsSeen({
            message_id,
            user_id,
        });

        io.to(eventId).emit('message_seen', { message_id, seenUsers });

        res.status(200).json({
            success: true,
            message: 'Message marked as seen',
            data: seenUsers,
        });
    } catch (err) {
        next(err);
    }
};