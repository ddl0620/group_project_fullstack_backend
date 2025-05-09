// src/models/candidate.model.ts
import { Schema, model } from 'mongoose';
import { UserInterface } from '../interfaces/user.interfaces';

/**
 * Mongoose schema for user accounts.
 * 
 * This schema defines the structure for user documents in MongoDB,
 * representing application users with authentication details and permissions.
 * It includes validation rules and default values for various user properties.
 */
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
        dateOfBirth: {
            type: Date,
            required: [true, 'Ngày sinh là bắt buộc'],
        },
        avatar: {
            default: '',
            type: String,
        },
        role: {
            type: String,
            default: 'user',
            enum: ['user', 'admin'],
        },
        maxEventCreate: {
            type: Number,
            default: 10,
        },
        maxParticipantPerEvent: {
            type: Number,
            default: 10,
        },
        isDeleted: {
            required: true,
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

/**
 * Mongoose model for user documents.
 * 
 * This model provides an interface for creating, querying, updating, and
 * deleting user accounts in the MongoDB 'user' collection.
 */
export const UserModel = model<UserInterface>('user', userSchema);
