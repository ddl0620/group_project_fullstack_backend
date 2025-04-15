// services/message.service.ts

import { MessageModel } from '../models/message.models';
import { MessageSeenModel } from '../models/messageSeen.models';
import { EventModel } from '../models/event.models';
import { HttpError } from '../helpers/httpsError.helpers';
import mongoose from 'mongoose';
import {
    SendMessageInput,
    MarkMessageAsSeenInput,
    MarkMessageAsSeenResponse,
} from '../types/message.type';

const getMessagesByEvent = async (eventId: string, userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
        throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
    }

    const isParticipant =
        event.participants &&
        event.participants.some(
            (participant) =>
                participant.userId && participant.userId.toString() === userId
        );
    const isOrganizer = event.organizer && event.organizer.toString() === userId;

    if (!isParticipant && !isOrganizer) {
        throw new HttpError(
            'You are not a participant of this event',
            403,
            'ACCESS_DENIED'
        );
    }

    const messages = await MessageModel.find({ event_id: eventId })
        .populate('sender_id', 'name email')
        .populate({
            path: 'seen_by',
            populate: { path: 'user_id', select: 'name' },
        })
        .sort({ send_at: 1 });

    return messages;
};

const createMessage = async (input: SendMessageInput) => {
    const { content, event_id, sender_id } = input;

    if (!content || content.trim().length === 0) {
        throw new HttpError('Message content is required', 400, 'MISSING_CONTENT');
    }
    if (!mongoose.Types.ObjectId.isValid(event_id)) {
        throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
    }
    if (!mongoose.Types.ObjectId.isValid(sender_id)) {
        throw new HttpError('Invalid sender ID format', 400, 'INVALID_SENDER_ID');
    }

    const event = await EventModel.findById(event_id);
    if (!event) {
        throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
    }

    const isParticipant =
        event.participants &&
        event.participants.some(
            (participant) =>
                participant.userId && participant.userId.toString() === sender_id
        );
    const isOrganizer = event.organizer && event.organizer.toString() === sender_id;

    if (!isParticipant && !isOrganizer) {
        throw new HttpError(
            'You are not a participant of this event',
            403,
            'ACCESS_DENIED'
        );
    }

    const message = await MessageModel.create({
        content,
        event_id,
        sender_id,
        send_at: new Date(),
    });

    return await message.populate('sender_id', 'name email');
};

const markMessageAsSeen = async (
    input: MarkMessageAsSeenInput
): Promise<MarkMessageAsSeenResponse> => {
    const { message_id, user_id } = input;

    if (!mongoose.Types.ObjectId.isValid(message_id)) {
        throw new HttpError('Invalid message ID format', 400, 'INVALID_MESSAGE_ID');
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new HttpError('Invalid user ID format', 400, 'INVALID_USER_ID');
    }

    const message = await MessageModel.findById(message_id);
    if (!message) {
        throw new HttpError('Message not found', 404, 'NOT_FOUND_MESSAGE');
    }

    const event = await EventModel.findById(message.event_id);
    if (!event) {
        throw new HttpError('Event not found', 404, 'NOT_FOUND_EVENT');
    }

    const isParticipant =
        event.participants &&
        event.participants.some(
            (participant) =>
                participant.userId && participant.userId.toString() === user_id
        );
    const isOrganizer = event.organizer && event.organizer.toString() === user_id;

    if (!isParticipant && !isOrganizer) {
        throw new HttpError(
            'You are not a participant of this event',
            403,
            'ACCESS_DENIED'
        );
    }

    const existingRecord = await MessageSeenModel.findOne({ message_id, user_id });
    if (!existingRecord) {
        await MessageSeenModel.create({
            message_id,
            user_id,
            seen_at: new Date(),
        });
    }

    const seenUsers = await MessageSeenModel.find({ message_id }).populate(
        'user_id',
        'name'
    );
    return { seenUsers, eventId: message.event_id.toString() };
};

export default { getMessagesByEvent, createMessage, markMessageAsSeen };