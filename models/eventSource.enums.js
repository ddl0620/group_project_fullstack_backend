"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSourceModel = void 0;
const mongoose_1 = require("mongoose");
const source_enum_1 = require("../enums/source.enum");
const eventSourceSchema = new mongoose_1.Schema({
    sourceName: {
        type: String,
        required: [true, 'Tên nguồn là bắt buộc'],
        trim: true,
        enum: {
            values: Object.values(source_enum_1.Source), // Danh sách nguồn cố định
            message: 'Nguồn không hợp lệ. Vui lòng chọn từ danh sách: {VALUE}',
        },
    },
    candidateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Candidate', // Liên kết với CandidateModel
        required: [true, 'ID thí sinh là bắt buộc'],
    },
}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
});
exports.EventSourceModel = (0, mongoose_1.model)('EventSource', eventSourceSchema);
