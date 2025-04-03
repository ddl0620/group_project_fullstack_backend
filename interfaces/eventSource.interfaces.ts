// src/interfaces/eventSource.interface.ts
import { Document, Types } from 'mongoose';

export interface EventSourceInterface extends Document {
    sourceName: string; // Tên nguồn (ví dụ: "Facebook", "Email")
    candidateId: Types.ObjectId; // ID của thí sinh đăng ký qua nguồn này
    createdAt: Date;
    updatedAt: Date;
}