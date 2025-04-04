import {Request, Response} from "express";
import {NextFunction} from "express";
import mongoose from "mongoose";
import {HttpError} from "../helpers/httpsError.helpers";

import {UserModel} from "../models/user.models";
// interface AuthenticationRequest extends Request {
//     user?: {
//         userId: string;
//     };
// }

export class EventController {
    async events(
        request: Request,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {

        response.status(200).json({
            success: true,
            message: "yoink"
        });

    }
}