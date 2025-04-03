"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateModel = void 0;
// src/models/candidate.model.ts
const mongoose_1 = require("mongoose");
const university_enums_1 = require("../enums/university.enums");
const major_enums_1 = require("../enums/major.enums");
const candidateSchema = new mongoose_1.Schema({
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
            values: Object.values(university_enums_1.University),
            message: 'Trường đại học không hợp lệ. Vui lòng chọn từ danh sách: {VALUE}',
        },
    },
    major: {
        type: String,
        required: [true, 'Ngành học là bắt buộc'],
        enum: {
            values: Object.values(major_enums_1.Major),
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
}, {
    timestamps: true,
});
exports.CandidateModel = (0, mongoose_1.model)('Candidate', candidateSchema);
