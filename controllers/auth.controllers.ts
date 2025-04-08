import { Request, Response } from "express";
import { NextFunction } from "express";
import mongoose from "mongoose";
import { HttpError } from "../helpers/httpsError.helpers";
import { generateToken } from "../helpers/jwtGenerate.helper";
import { UserModel } from "../models/user.models";
import bcrypt from "bcryptjs";
import { USER_TYPE } from "../enums/userType.enums";

export class AuthControllers {
    async signUp(
        request: Request,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            console.log("sign up started");
            const { name, email, password, dob, gender, role } = request.body;
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                throw new HttpError(
                    "User already exists",
                    400,
                    "USER_EXISTS",
                    response
                );
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const [newUser] = await UserModel.create(
                [
                    {
                        name,
                        email,
                        password: hashedPassword,
                        dob,
                        gender: gender === "male",
                        role: role || USER_TYPE.USER,
                    },
                ],
                { session: session }
            );

            const token = generateToken(newUser.id.toString());

            await session.commitTransaction();
            await session.endSession();

            response.status(201).json({
                success: true,
                message: "User created successfully",
                data: {
                    user: newUser,
                    token,
                },
            });
        } catch (err) {
            await session.abortTransaction();
            nextFunction(err);
        } finally {
            session.endSession();
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
            const user = await UserModel.findOne({ email });

            if (!user) {
                throw new HttpError(
                    "User does not exist",
                    400,
                    "USER_NOT_EXISTS",
                    response
                );
            }

            const isValidPassword: boolean = await bcrypt.compare(
                password,
                user.password
            );
            if (!isValidPassword) {
                throw new HttpError(
                    "Invalid password",
                    400,
                    "INVALID_PASSWORD",
                    response
                );
            }
            const token: string = generateToken(user.id.toString());
            response.status(200).json({
                success: true,
                message: "User signed in successfully",
                data: {
                    user,
                    token,
                },
            });
        } catch (err) {
            nextFunction(err);
        } finally {
            session.endSession();
        }
    }
}
