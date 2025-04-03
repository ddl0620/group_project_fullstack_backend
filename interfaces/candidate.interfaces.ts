// src/interfaces/candidate.interface.ts
import { Document, Types } from 'mongoose';
import {University} from "../enums/university.enums";
import {Major} from "../enums/major.enums";


export interface CandidateInterface extends Document {
    name: string;
    dob: Date;
    email: string;
    phone: string;
    cccd: string;
    university: University;
    major: Major;
    sid: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    examAttempts?: number; // Số lần thoát màn hình (theo yêu cầu "Cảnh báo khi thoát màn hình")
    score?: number; // Điểm thi (liên quan đến Exam)
    votes?: number; // Số lượt bình chọn (liên quan đến Vote)
}