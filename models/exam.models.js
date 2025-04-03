"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamModel = void 0;
const mongoose_1 = require("mongoose");
const examSchema = new mongoose_1.Schema({
    examId: {
        type: String,
        required: [true, "Ma đề thi là bắt buộc"],
        unique: true,
        trim: true,
    },
    content: {
        type: String,
        required: [true, "Nội dung đề thi là bắt buộc"],
        trim: true,
    },
    answers: {
        type: mongoose_1.Schema.Types.Mixed,
        required: [true, "Đáp án là bắt buộc"],
    }
}, {
    timestamps: true,
});
exports.ExamModel = (0, mongoose_1.model)("Exam", examSchema);
