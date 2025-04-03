import {ExamInterface} from "../interfaces/exam.interfaces";
import {model, Schema} from "mongoose";

const examSchema = new Schema<ExamInterface>({
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
        type: Schema.Types.Mixed,
        required: [true, "Đáp án là bắt buộc"],
    }
    }, {
        timestamps: true,
    }
);

export const ExamModel = model<ExamInterface>("Exam", examSchema);