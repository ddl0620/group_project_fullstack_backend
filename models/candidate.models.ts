// src/models/candidate.model.ts
import { Schema, model } from 'mongoose';
import {CandidateInterface} from "../interfaces/candidate.interfaces";
import {University} from "../enums/university.enums";
import {Major} from "../enums/major.enums";


const candidateSchema = new Schema<CandidateInterface>(
    {
        name: {
            type: String,
            required: [true, 'Tên là bắt buộc'],
            trim: true,
        },
        dob: {
            type: Date,
            required: [true, 'Ngày sinh là bắt buộc'],
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        },
        phone: {
            type: String,
            default: '',
            trim: true,
            match: [/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'],
        },
        cccd: {
            type: String,
            default: '',
            trim: true,
            match: [/^[0-9]{9,12}$/, 'Số CCCD không hợp lệ'],
        },
        university: {
            type: String,
            required: [true, 'Trường đại học là bắt buộc'],
            enum: {
                values: Object.values(University),
                message: 'Trường đại học không hợp lệ. Vui lòng chọn từ danh sách: {VALUE}',
            },
        },
        major: {
            type: String,
            required: [true, 'Ngành học là bắt buộc'],
            enum: {
                values: Object.values(Major),
                message: 'Ngành học không hợp lệ. Vui lòng chọn từ danh sách: {VALUE}',
            },
        },
        sid: {
            type: String,
            default: '',
            trim: true,
            match: [/^[A-Za-z0-9-]+$/, 'Mã sinh viên không hợp lệ'],
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc'],
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        },
        role: {
            type: String,
            default: 'candidate',
            enum: ['candidate', 'admin', 'moderator'],
        },
        examAttempts: {
            type: Number,
            default: 0,
        },
        score: {
            type: Number,
            default: null,
        },
        votes: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const CandidateModel = model<CandidateInterface>('Candidate', candidateSchema);