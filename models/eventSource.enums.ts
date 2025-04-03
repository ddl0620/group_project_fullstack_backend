import { Schema, model } from 'mongoose';
import {EventSourceInterface} from "../interfaces/eventSource.interfaces";
import {Source} from "../enums/source.enum";

const eventSourceSchema = new Schema<EventSourceInterface>(
    {
        sourceName: {
            type: String,
            required: [true, 'Tên nguồn là bắt buộc'],
            trim: true,
            enum: {
                values: Object.values(Source), // Danh sách nguồn cố định
                message: 'Nguồn không hợp lệ. Vui lòng chọn từ danh sách: {VALUE}',
            },
        },
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: 'Candidate', // Liên kết với CandidateModel
            required: [true, 'ID thí sinh là bắt buộc'],
        },
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    }
);

export const EventSourceModel = model<EventSourceInterface>('EventSource', eventSourceSchema);