import { NextFunction, Request, Response } from 'express';
import { generateToken } from '../helpers/jwtGenerate.helper';
import { UserInterface } from '../interfaces/user.interfaces';
import { AuthService } from '../services/auth.service';
import { HttpResponse } from '../helpers/HttpResponse';
import { SignInType, SignUpType } from '../types/auth.type';

export class AuthControllers {
    async signUp(
        request: Request,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        try {
            const { name, email, password, role } = request.body as SignUpType;

            const newUser: UserInterface = await AuthService.createUser({
                name,
                email,
                password,
                confirmPassword: password,
                role,
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
        try {
            const { email, password } = request.body as SignInType;

            const user: UserInterface = await AuthService.validateCredentials({
                email,
                password,
            });

            const token: string = generateToken(user.id.toString());
            HttpResponse.sendYES(response, 200, 'Login successful', {
                user,
                token,
            });
        } catch (err) {
            nextFunction(err);
        }
    }
}