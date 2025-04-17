import {Response, NextFunction } from "express";
import { EventModel } from "../models/event.models";
import { HttpError } from "../helpers/httpsError.helpers";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";

export const checkEventParticipant = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.userId;

        const event = await EventModel.findOne({
            _id: eventId,
            $or: [
                { organizer: userId },
                { "participants.userId": userId }
            ]
        });

        if (!event) {
            throw new HttpError("You are not authorized to access this event", 403, "UNAUTHORIZED");
        }

        next();
    } catch (err) {
        next(err);
    }
};