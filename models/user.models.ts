// src/models/candidate.model.ts
import { Schema, model } from "mongoose";
import { UserInterface } from "../interfaces/user.interfaces";
import { USER_TYPE } from "../enums/userType.enums";

const userSchema = new Schema<UserInterface>(
    {
        avatar: { type: String, default: "" },
        name: {
            type: String,
            required: [true, "Tên là bắt buộc"],
            trim: true,
            minlength: [2, "Tên phải có ít nhất 2 ký tự"],
            maxlength: [50, "Tên không được vượt quá 50 ký tự"],
        },
        dob: {
            required: true,
            type: Date,
        },
        gender: {
            type: Boolean,
            required: true,
            default: true,
        },
        email: {
            type: String,
            required: [true, "Email là bắt buộc"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
        },
        password: {
            type: String,
            required: [true, "Mật khẩu là bắt buộc"],
            minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
        },
        role: {
            type: String,
            enum: Object.values(USER_TYPE),
            required: true,
            default: USER_TYPE.USER,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.path("dob").validate(function (value) {
    return value < new Date();
}, "dob must be in the past");

export const UserModel = model<UserInterface>("user", userSchema);
