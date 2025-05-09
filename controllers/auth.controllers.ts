import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { HttpResponse } from '../helpers/HttpResponse';
import { SignInResponse, SignInType, SignUpResponse, SignUpType } from '../types/auth.type';
import { signInSchema, signUpSchema } from '../validation/auth.validation';
import { validateInput } from '../helpers/validateInput';
import {OtpService} from "../services/otp.service";

export class AuthControllers {
    async signUp(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        try {
            validateInput(signUpSchema, request.body);

            // const newUser: SignUpResponse = await AuthService.createUser({
            //     ...(request.body as SignUpType),
            //     confirmPassword: request.body.password,
            // });
            //
            // HttpResponse.sendYES(response, 201, 'User created successfully', newUser);

            await AuthService.initiateSignUp({
                ...(request.body as SignUpType),
                confirmPassword: request.body.password,
            });

            HttpResponse.sendYES(response, 200, 'Verification code sent for signup', {
                email: request.body.email,
            });


        } catch (err) {
            nextFunction(err);
        }
    }


    async signIn(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        try {
            validateInput(signInSchema, request.body);
            const { email, password } = request.body as SignInType;
            const result: SignInResponse = await AuthService.validateCredentials({
                email,
                password,
            });

            HttpResponse.sendYES(response, 200, 'Login successful', result);
        } catch (err) {
            nextFunction(err);
        }
    }

    async sendVerification(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        try {
            const { email } = request.body;
            await AuthService.sendVerificationCode(email);
            HttpResponse.sendYES(response, 200, 'Verification code sent successfully', { email });
        } catch (err) {
            nextFunction(err);
        }
    }

    async verifyCode(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        try {
            const { email, code } = request.body;
            OtpService.verifyOtp(email, code);
            HttpResponse.sendYES(response, 200, 'Verification successful', { email, code });
        } catch (err) {
            nextFunction(err);
        }
    }


    async verifySignUp(request: Request, response: Response, nextFunction: NextFunction): Promise<void> {
        try {
            const { email, code } = request.body;
            const result = await AuthService.completeSignUp(email, code);
            HttpResponse.sendYES(response, 201, 'User created successfully', result);
        } catch (err) {
            nextFunction(err);
        }
    }





}
