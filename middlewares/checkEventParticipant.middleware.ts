import { Response, NextFunction } from "express";
import { EventModel } from "../models/event.models";
import { HttpError } from "../helpers/httpsError.helpers";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";

export const checkEventParticipant = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.userId;

        // Log middleware call and values to debug
        console.log("Middleware checkEventParticipant called");
        console.log("eventId:", eventId);
        console.log("userId:", userId);

        // Validate eventId format
        if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new HttpError("Invalid event ID format", 400, "INVALID_EVENT_ID");
        }

        // Validate userId
        if (!userId) {
            throw new HttpError("User ID is missing", 401, "USER_ID_MISSING");
        }

        // Check event access
        const event = await EventModel.findOne({
            _id: eventId,
            isDeleted: false,
            $or: [
                { organizer: userId },
                { "participants": { $elemMatch: { userId, status: "ACCEPTED" } } }
            ]
        });

        // Log kết quả query
        if (!event) {
            console.log("Event not found or isDeleted is true");
        } else {
            console.log("Event found:", event);
        }

        if (!event) {
            throw new HttpError("You are not authorized to access this event", 403, "UNAUTHORIZED");
        }

        next();
    } catch (err) {
        next(err);
    }
};