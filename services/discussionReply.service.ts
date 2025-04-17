import { DiscussionReplyInterface } from "../interfaces/discussionReply.interfaces";
import { DiscussionReplyModel } from "../models/discussionReply.model";
import { CreateReplyInput, UpdateReplyInput } from "../types/discussionReply.type";

export class DiscussionReplyService {
    // Tạo bình luận mới
    static async createReply(data: CreateReplyInput): Promise<DiscussionReplyInterface> {
        return await DiscussionReplyModel.create(data);
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
        return await DiscussionReplyModel.findByIdAndUpdate(
            reply_id,
            { isDeleted: true },
            { new: true }
        );
    }
}