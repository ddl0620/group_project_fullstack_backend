import { NextFunction, Request, Response } from 'express';
import {HttpError} from "../helpers/httpsError.helpers";

interface UserRequest extends Request {
    user?: {
        userId: string;
    };
}

export const onlySelf = (
    request: UserRequest,
    response: Response,
    nextFunction: NextFunction
) =>{

    const userIdInput = request.params.id;
    const userIdToken = request.user?.userId;

    if(!request.user){
        new HttpError("User not found", 404, "USER_NOT_FOUND");
    }

    console.log(request.body.userId + " " + request.user?.userId);
    if(userIdInput !== userIdToken){
        return nextFunction(new HttpError("You are not authorized to do this", 403, "UNAUTHORIZED"));
    }

    nextFunction();
}