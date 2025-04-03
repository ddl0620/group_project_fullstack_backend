"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteModel = void 0;
const mongoose_1 = require("mongoose");
const voteSchema = new mongoose_1.Schema({
    voterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Candidate', // Liên kết với CandidateModel (người bình chọn)
        required: [true, 'ID người bình chọn là bắt buộc'],
    },
    candidateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Candidate', // Liên kết với CandidateModel (thí sinh được bình chọn)
        required: [true, 'ID thí sinh được bình chọn là bắt buộc'],
    },
}, {
    timestamps: true,
});
// Đảm bảo mỗi người chỉ bình chọn cho một thí sinh một lần
voteSchema.index({ voterId: 1, candidateId: 1 }, { unique: true });
exports.VoteModel = (0, mongoose_1.model)('Vote', voteSchema);
