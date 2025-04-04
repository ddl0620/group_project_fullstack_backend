import {Request, Response} from "express";
import {NextFunction} from "express";
import mongoose from "mongoose";
import {HttpError} from "../helpers/httpsError.helpers";
import {UserModel} from "../models/user.models";
import {UserInterface} from "../interfaces/user.interfaces";
interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
    };
}

export class UserController {
    async me(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        const session = await mongoose.startSession()
        session.startTransaction();

        try{
            const user = await UserModel.findById(request.user?.userId)
                .select("-password")

            if(!user) {
                return nextFunction(new HttpError("User not found", 404, "USER_NOT_FOUND"));
            }

            response.status(200).json({
                success: true,
                message: "Fetch user successfully",
                data: {
                    user
                }
            });



        }
        catch(err){
            await session.abortTransaction();
            nextFunction(err);
        }
        finally {
            session.endSession();
        }

    }

    async updateInfor(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        const updatedInfor = Object.keys(request.body);
        const notAllowedField = ["password", "userId", "role"];

        const isValidOperation = updatedInfor.every((update) => !notAllowedField.includes(update));
        if(!isValidOperation){
            return nextFunction(new HttpError("Invalid update field", 400, "INVALID_UPDATE_FIELD"));
        }

        try{
            if(!request.user){
                return nextFunction(new HttpError("Invalid request body", 404, "REQUEST_NO_USER"));
            }

            const user: (UserInterface | null) = await UserModel.findById(request.user?.userId);

            if(!user) {
                return nextFunction(new HttpError("User not found", 404, "USER_NOT_FOUND"));
            }

            // @ts-ignore
            updatedInfor.forEach((field) => (user[field] = request.body[field]));

            await user.save();
            response.status(201).json({
                success: true,
                message: "User updated successfully",
                updatedUser: user
            })
        }
        catch(err){
            console.error(err);
            return nextFunction(
                new HttpError("Invalid update field", 400, "INVALID_UPDATE_FIELD"),
            );
        }
    }
}