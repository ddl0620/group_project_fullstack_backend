import { Request, Response } from "express";
import { NextFunction } from "express";
import mongoose from "mongoose";
import { HttpError } from "../helpers/httpsError.helpers";
import { UserModel } from "../models/user.models";
import { UserInterface } from "../interfaces/user.interfaces";

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
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await UserModel.findById(request.user?.userId).select(
                "-password"
            );

            if (!user) {
                return nextFunction(
                    new HttpError("User not found", 404, "USER_NOT_FOUND")
                );
            }

            response.status(200).json({
                success: true,
                message: "Fetch user successfully",
                data: {
                    user,
                },
            });
        } catch (err) {
            await session.abortTransaction();
            nextFunction(err);
        } finally {
            session.endSession();
        }
    }

    async updateInfor(
        request: AuthenticationRequest,
        response: Response,
        nextFunction: NextFunction
    ): Promise<void> {
        // Lấy danh sách các trường từ request.body
        const updatedInfor = Object.keys(
            request.body
        ) as (keyof UserInterface)[];
        const notAllowedField = ["password", "userId", "role"];

        console.log(request.body);

        // Kiểm tra xem có trường không được phép hay không
        const isValidOperation = updatedInfor.every(
            (update) => !notAllowedField.includes(update)
        );
        if (!isValidOperation) {
            return nextFunction(
                new HttpError(
                    "Invalid update field",
                    400,
                    "INVALID_UPDATE_FIELD"
                )
            );
        }

        try {
            // Kiểm tra xem request.user có tồn tại không
            if (!request.user || !request.user.userId) {
                return nextFunction(
                    new HttpError(
                        "Invalid request body",
                        404,
                        "REQUEST_NO_USER"
                    )
                );
            }

            // Tìm user trong database
            const user: UserInterface | null = await UserModel.findById(
                request.user.userId
            );

            if (!user) {
                return nextFunction(
                    new HttpError("User not found", 404, "USER_NOT_FOUND")
                );
            }

            if (updatedInfor.includes("email")) {
                const existingUser = await UserModel.findOne({
                    email: request.body.email,
                    _id: { $ne: request.user.userId }, // Loại trừ chính user hiện tại
                });
                if (existingUser) {
                    return nextFunction(
                        new HttpError(
                            "Email already exists",
                            400,
                            "EMAIL_EXISTS"
                        )
                    );
                }
            }

            // Validation và gán giá trị
            updatedInfor.forEach((field) => {
                // Chỉ gán nếu field tồn tại trong schema
                if (field in user) {
                    // Xử lý đặc biệt cho các trường có kiểu dữ liệu cụ thể
                    if (
                        field === "dob" &&
                        typeof request.body[field] === "string"
                    ) {
                        const dob = new Date(request.body[field]);
                        if (isNaN(dob.getTime())) {
                            throw new HttpError(
                                "Invalid date format for dob",
                                400,
                                "INVALID_DOB"
                            );
                        }
                        user[field] = dob;
                    } else if (
                        field === "gender" &&
                        typeof request.body[field] !== "boolean"
                    ) {
                        throw new HttpError(
                            "Gender must be a boolean",
                            400,
                            "INVALID_GENDER"
                        );
                    } else {
                        // Gán giá trị cho các trường khác
                        (user[field] as any) = request.body[field];
                    }
                }
            });

            // Lưu user sau khi cập nhật
            await user.save();

            // Trả về phản hồi
            response.status(201).json({
                success: true,
                message: "User updated successfully",
                updatedUser: user,
            });
        } catch (err) {
            console.error(err);
            return nextFunction(
                new HttpError(
                    err instanceof HttpError ? err.message : "Cannot update",
                    400,
                    err instanceof HttpError ? err.code : "UPDATE_FAILED"
                )
            );
        }
    }
}
