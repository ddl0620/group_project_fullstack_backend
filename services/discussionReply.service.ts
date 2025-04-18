import { DiscussionReplyInterface } from "../interfaces/discussionReply.interfaces";
import { DiscussionReplyModel } from "../models/discussionReply.model";
import { CreateReplyInput, UpdateReplyInput } from "../types/discussionReply.type";
import { HttpError } from '../helpers/httpsError.helpers';

export class DiscussionReplyService {
    // Tạo bình luận mới
    static async createReply(data: CreateReplyInput): Promise<DiscussionReplyInterface> {
        const { parent_reply_id, ...rest } = data;
        return await DiscussionReplyModel.create({
            ...rest,
            parent_reply_id: parent_reply_id || null, // Đảm bảo không ảnh hưởng đến các thuộc tính khác
        });
    }

    // Lấy danh sách bình luận (chỉ lấy bình luận chưa bị xóa)
    static async getReplies(post_id: string, page: number, limit: number): Promise<DiscussionReplyInterface[]> {
        const skip = (page - 1) * limit;
        return await DiscussionReplyModel.find({ post_id, isDeleted: false })
            .populate("creator_id", "username")
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });
    }

    // Lấy chi tiết bình luận
    static async getReplyById(reply_id: string): Promise<DiscussionReplyInterface | null> {
        return await DiscussionReplyModel.findOne({ _id: reply_id, isDeleted: false }).populate("creator_id", "username");
    }

    // Cập nhật bình luận
    static async updateReply(reply_id: string, updateData: UpdateReplyInput): Promise<DiscussionReplyInterface | null> {
        return await DiscussionReplyModel.findByIdAndUpdate(reply_id, updateData, { new: true });
    }

    // Soft delete bình luận
    static async deleteReply(reply_id: string): Promise<DiscussionReplyInterface | null> {
        const reply = await DiscussionReplyModel.findById(reply_id);
        if (!reply) {
            throw new HttpError('Failed to delete comment', 500, 'DELETE_COMMENT_FAILED');
        }
        return await DiscussionReplyModel.findByIdAndUpdate(
            reply_id,
            { isDeleted: true },
            { new: true }
        );
    }
}