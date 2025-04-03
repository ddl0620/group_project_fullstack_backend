import {Request, Response} from "express";
import {NextFunction} from "express";
import mongoose from "mongoose";
import {HttpError} from "../helpers/httpsError.helpers";
import {generateToken} from "../helpers/jwtGenerate.helper";
import {UserModel} from "../models/user.models";
import bcrypt from "bcryptjs";
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
                message: "User retrieved successfully",
                data: user
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
}