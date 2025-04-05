import {Request, Response} from "express";
import {NextFunction} from "express";
import mongoose from "mongoose";
//import {HttpError} from "../helpers/httpsError.helpers";
import {EventModel} from "../models/event.models";

export class EventController {
    async addEvent(
        req: Request,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        const session = await mongoose.startSession()
        session.startTransaction();

        try {
            console.log("add an event");

            const {title, description, type, startDate, endDate, location, images, organizer, participants, isPublic} = req.body;

            const [newEvent] = await EventModel.create(
                [{
                    title,
                    description,
                    type,
                    startDate,
                    endDate,
                    location,
                    images,
                    organizer,
                    participants,
                    isPublic,
                }],
                {session: session}
            )

            await session.commitTransaction();
            await session.endSession();

            res.status(201).json({
                success: true,
                message: "Event added successfully",
                data: {
                    event: newEvent
                }
            })
        }
        catch(err) {
            await session.abortTransaction();
            next(err);
        }
        finally {
            await session.endSession();
        }

    }
}