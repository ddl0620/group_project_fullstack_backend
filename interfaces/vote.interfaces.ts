// src/interfaces/vote.interface.ts
import { Document, Types } from 'mongoose';

export interface VoteInterface extends Document {
    voterId: Types.ObjectId; // ID của người bình chọn
    candidateId: Types.ObjectId; // ID của thí sinh được bình chọn
    createdAt: Date;
    updatedAt: Date;
}