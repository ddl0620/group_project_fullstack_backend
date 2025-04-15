import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { generateToken } from '../helpers/jwtGenerate.helper';
import { UserInterface } from '../interfaces/user.interfaces';
import { AuthService } from '../services/auth.service';
import { HttpResponse } from '../helpers/HttpResponse';

export class AuthControllers {
    async signUp(
        request: Request,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        try {
            const { name, email, password, role } = request.body;

            const newUser: UserInterface = await AuthService.createUser({
                name,
                email,
                password,
                confirmPassword: password,
                role: role,
            });

            HttpResponse.sendYES(response, 201, 'User created successfully', {
                user: newUser,
            });
        } catch (err) {
            nextFunction(err);
        }
    }

    async signIn(
        request: Request,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { email, password } = request.body;

            const user: UserInterface = await AuthService.validateCredentials({
                email,
                password,
            });

            const token: string = generateToken(user.id.toString());
            HttpResponse.sendYES(response, 200, 'Login successful', {
                user: user,
                token: token,
            });
        } catch (err) {
            nextFunction(err);
        } finally {
            await session.endSession();
        }
    }
}
