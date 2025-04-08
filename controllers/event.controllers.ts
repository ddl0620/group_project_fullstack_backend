import {Request, Response} from "express";
import {NextFunction} from "express";
import mongoose from "mongoose";
//import {HttpError} from "../helpers/httpsError.helpers";
import {EventModel} from "../models/event.models";
import {UserModel} from "../models/user.models";
import {HttpError} from "../helpers/httpsError.helpers";
import {EventInterface} from "../interfaces/event.interfaces";

interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
    };
}

export class EventController {
    async addEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        const session = await mongoose.startSession()
        session.startTransaction();

        try {
            console.log("add an event");

            const user = await UserModel.findById(req.user?.userId)
                .select("-password");

            if (!user) {
                return next(new HttpError("User not found", 404, "USER_NOT_FOUND"));
            }


            const {title, description, type, startDate, endDate, location, images, participants, isPublic} = req.body;
            const organizer = req.user!.userId;

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
        req: AuthenticationRequest,
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

            const userId = req.user?.userId;

            if (!userId) {
                return next(new HttpError("nope", 401, "not today"));
            }

            const query = {
                $or: [
                    { isPublic: true },
                    { organizer: userId },
                    { "participants.userId": userId } // Fixed query
                ]
            };

            const events = await EventModel.find(query)
                .sort({ createdAt: sortOrder })
                .skip(skip)
                .limit(limit);


            const totalEvents = await EventModel.countDocuments(query);

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
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        try {
            console.log("getting event by ID");

            const {id} = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return next(new HttpError("nope", 401, "not today"));
            }


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

            if (!event.isPublic) {
                const isOrganizer = event.organizer && event.organizer.toString() === userId;
                const isParticipant = event.participants && event.participants.some(
                    (participant) => participant.userId && participant.userId.toString() === userId
                ) || false; // Default to false if participants is null/undefined

                if (!isOrganizer && !isParticipant) {
                    return next(new HttpError("Access denied to private event", 403, "ACCESS_DENIED"));
                }
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
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        try {
            console.log("update event");


            const {id} = req.params;
            const {title, description, type, startDate, endDate, location, images, organizer, participants, isPublic} = req.body;

            const userId = req.user?.userId;

            if (!userId) {
                return next(new HttpError("nope", 401, "not today"));
            }

            const event: (EventInterface | null) = await EventModel.findById(id);

            if (!event) {
                res.status(404).json({
                    success: false,
                    message: "Event not found"
                })
                return;
            }

            if (!event.organizer || event.organizer.toString() !== userId) {
                return next(new HttpError("Event not found", 403, "not today"));
            }


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

    async deleteEvent(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction
    ) : Promise<void> {
        try {
            console.log("deleting event");
            const { id } = req.params;

            const userId = req.user?.userId;
            if (!userId) {
                return next(new HttpError("Authentication required to delete events", 401, "AUTH_REQUIRED"));
            }

            const event = await EventModel.findById(id);

            if (!event) {
                res.status(404).json({
                    success: false,
                    message: "Event not found",
                });
                return;
            }

            // Check if organizer exists and matches the authenticated user
            if (!event.organizer || event.organizer.toString() !== userId) {
                return next(new HttpError("Only the organizer can delete this event", 403, "FORBIDDEN"));
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid event ID format",
                });
                return;
            }

            const deletedEvent = await EventModel.findByIdAndDelete(id);

            if (!deletedEvent) {
                res.status(404).json({
                    success: false,
                    message: "Event not found"
                })
            }

            res.status(200).json({
                success: true,
                message: "Event deleted successfully",
                data: {
                    deletedEvent,
                }
            })

        }
        catch(err) {
            next(err);
        }
    }
}