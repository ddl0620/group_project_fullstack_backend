import { Response, NextFunction } from 'express';
import { EventModel } from '../models/event.models';
import { HttpError } from '../helpers/httpsError.helpers';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import mongoose from 'mongoose';

/**
 * Event Access Control Middleware
 * 
 * Verifies that the authenticated user has permission to access a specific event.
 * Access is granted if the user is either:
 * 1. The event organizer
 * 2. An accepted participant of the event
 * 
 * This middleware expects the event ID to be present in the request parameters
 * and requires prior authentication to have populated the user information.
 * 
 * @param req - Extended Express request with authentication properties and event parameters
 * @param res - Express response object (unused but required by Express middleware signature)
 * @param next - Express next middleware function
 * @returns void - Calls next middleware or error handler
 * 
 * @throws HttpError(400) - If the event ID format is invalid
 * @throws HttpError(401) - If user ID is missing (authentication issue)
 * @throws HttpError(403) - If user is not authorized to access the event
 */
export const allowedUserMiddleware = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.userId;

        // Log middleware call and values to debug
        console.log('Middleware checkEventParticipant called');
        console.log('eventId:', eventId);
        console.log('userId:', userId);

        // Validate eventId format
        if (!mongoose.isValidObjectId(eventId)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        // Validate userId
        if (!userId) {
            throw new HttpError('User ID is missing', 401, 'USER_ID_MISSING');
        }

        // Check event access
        const event = await EventModel.findOne({
            _id: eventId,
            isDeleted: false,
            $or: [
                { organizer: userId },
                { participants: { $elemMatch: { userId, status: 'ACCEPTED' } } },
            ],
        });

        // Log kết quả query
        if (!event) {
            console.log('Event not found or isDeleted is true');
        } else {
            console.log('Event found:', event);
        }

        if (!event) {
            throw new HttpError('You are not authorized to access this event', 403, 'UNAUTHORIZED');
        }

        next();
    } catch (err) {
        next(err);
    }
};
