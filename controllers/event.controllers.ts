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

    async getEvent(
        req: Request,
        res: Response,
        next: NextFunction
    ) : Promise<void> {

        try {
            console.log("getting event");

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sortBy = ((req.query.sortBy as string) || "desc").toLowerCase();
            const skip = (page - 1) * limit;

            const sortOrder = sortBy === "asc" ? 1 : -1;

            const events = await EventModel.find()
                .sort({createdAt: sortOrder})
                .skip(skip)
                .limit(limit);

            const totalEvents = await EventModel.countDocuments();


            res.status(200).json({
                success: true,
                message: "Event fetched successfully",
                data: {
                    events,
                    pagination: {
                        page,
                        limit,
                        totalPages: Math.ceil(totalEvents / limit),
                        totalEvents,
                    }
                }
            })
        }
        catch(err) {
            next(err);
        }
    }

    async getEventById(
        req: Request,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        try {
            console.log("getting event by ID");

            const {id} = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid event ID format"
                });
                return;
            }

            const event = await EventModel.findById(id);

            if (!event) {
                res.status(404).json({
                    success: false,
                    message: "Event not found"
                })
                return;
            }

            res.status(200).json({
                success: true,
                message: "Event found successfully",
                data: {
                    event,
                }
            })

        }
        catch(err) {
            next(err);
        }
    }

    async updateEvent (
        req: Request,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        try {
            console.log("update event");


            const {id} = req.params;
            const {title, description, type, startDate, endDate, location, images, organizer, participants, isPublic} = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid event ID format",
                });
                return;
            }

            const updatedEvent = await EventModel.findByIdAndUpdate(
                id,
                {
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
                },
                { new: true }
            )

            if (!updatedEvent) {
                res.status(404).json({
                    success: false,
                    message: "Event not found"
                })
                return;
            }

            res.status(200).json({
                success: true,
                message: "Event updated successfully",
                data: {
                    updatedEvent,
                }
            })

        }
        catch(err) {
            next(err);
        }
    }

}