import { Schema, model } from 'mongoose';
import {VoteInterface} from "../interfaces/vote.interfaces";

const voteSchema = new Schema<VoteInterface>(
    {
        voterId: {
            type: Schema.Types.ObjectId,
            ref: 'Candidate', // Liên kết với CandidateModel (người bình chọn)
            required: [true, 'ID người bình chọn là bắt buộc'],
        },
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: 'Candidate', // Liên kết với CandidateModel (thí sinh được bình chọn)
            required: [true, 'ID thí sinh được bình chọn là bắt buộc'],
        },
    },
    {
        timestamps: true,
    }
);

// Đảm bảo mỗi người chỉ bình chọn cho một thí sinh một lần
voteSchema.index({ voterId: 1, candidateId: 1 }, { unique: true });

export const VoteModel = model<VoteInterface>('Vote', voteSchema);