import { Request, Response, NextFunction } from 'express';
import { HttpResponse } from '../helpers/HttpResponse';
import { UserService } from '../services/user.service';
import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";
// import {AuthenticationRequest} from "../interfaces/authenticationRequest.interface";

// interface AuthenticationRequest extends Request {
//     user: {
//         userId: string;
//     };
// }

export class UserController {
    async me(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        if(!request.user) throw new Error("User not found in request");
        try {
            const user = await UserService.getCurrentUser(request.user.userId);

            HttpResponse.sendYES(response, 200, 'Fetch user successfully', {
                user,
            });
        } catch (err) {
            nextFunction(err);
        }
    }

    async updateInfor(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        if(!request.user) throw new Error("User not found in request");
        try {
            const updatedUser = await UserService.updateUser(
                request.user.userId,
                request.body
            );

            HttpResponse.sendYES(response, 200, 'User updated successfully', {
                user: updatedUser,
            });
        } catch (err) {
            nextFunction(err);
        }
    }
}