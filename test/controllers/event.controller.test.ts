import { EventController } from "../../controllers/event.controllers";
import { EventModel } from "../../models/event.models";
import { UserModel } from "../../models/user.models";
import { HttpError } from "../../helpers/httpsError.helpers";
import mongoose from "mongoose";

// Sửa đường dẫn trong jest.mock
jest.mock("../../models/event.models");
jest.mock("../../models/user.models");

const mockRequest = (body = {}, params = {}, user = {}) =>
    ({
        body,
        params,
        user,
    }) as any;

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe("EventController", () => {
    let controller: EventController;

    beforeEach(() => {
        controller = new EventController();
        jest.clearAllMocks();
    });

    describe("addEvent", () => {
        it("should create an event successfully", async () => {
            const req = mockRequest(
                {
                    title: "Test Event",
                    description: "Test",
                    type: "ONLINE",
                    startDate: new Date(),
                    endDate: new Date(),
                    isPublic: true,
                },
                {},
                { userId: "123" }
            );
            const res = mockResponse();

            (UserModel.findById as jest.Mock).mockResolvedValue({ _id: "123" });
            (EventModel.create as jest.Mock).mockResolvedValue([
                { _id: "event123", title: "Test Event" },
            ]);
            mongoose.startSession = jest.fn().mockResolvedValue({
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn(),
            });

            await controller.addEvent(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event added successfully",
                data: { event: { _id: "event123", title: "Test Event" } },
            });
        });

        it("should throw error if user not found", async () => {
            const req = mockRequest({}, {}, { userId: "123" });
            const res = mockResponse();

            (UserModel.findById as jest.Mock).mockResolvedValue(null);

            await controller.addEvent(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
            expect(mockNext.mock.calls[0][0].message).toBe("User not found");
        });
    });

    describe("getEventById", () => {
        it("should return event if user is organizer", async () => {
            const req = mockRequest(
                {},
                { id: "event123" },
                { userId: "user123" }
            );
            const res = mockResponse();

            (EventModel.findById as jest.Mock).mockResolvedValue({
                _id: "event123",
                isPublic: false,
                organizer: "user123",
                participants: [],
            });

            await controller.getEventById(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event found successfully",
                data: { event: expect.any(Object) },
            });
        });

        it("should throw error for invalid ID", async () => {
            const req = mockRequest(
                {},
                { id: "invalid" },
                { userId: "user123" }
            );
            const res = mockResponse();

            await controller.getEventById(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid event ID format",
            });
        });
    });
});
