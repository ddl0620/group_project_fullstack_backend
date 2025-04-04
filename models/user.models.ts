// src/models/candidate.model.ts
import { Schema, model } from 'mongoose';
import {UserInterface} from "../interfaces/user.interfaces";

const userSchema = new Schema<UserInterface>(
    {
        name: {
            type: String,
            required: [true, 'Tên là bắt buộc'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc'],
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        },
        role: {
            type: String,
            default: 'user',
            enum: ['user', 'admin']
        }
    },
    {
        timestamps: true,
    }
);

export const UserModel = model<UserInterface>('User', userSchema);