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
        return DiscussionReplyModel.find({post_id, isDeleted: false})
            .populate("creator_id", "username")
            .skip(skip)
            .limit(limit)
            .sort({created_at: -1});
    }

    // Lấy chi tiết bình luận
    static async getReplyById(reply_id: string): Promise<DiscussionReplyInterface | null> {
        return await DiscussionReplyModel.findOne({ _id: reply_id, isDeleted: false }).populate("creator_id", "username");
    }

    // Cập nhật bình luận
    static async updateReply(reply_id: string, updateData: UpdateReplyInput): Promise<DiscussionReplyInterface | null> {
        return await DiscussionReplyModel.findByIdAndUpdate(reply_id, updateData, { new: true });
    }

    // Soft delete tất cả các reply liên quan đến post_id
    static async softDeleteRepliesByPost(postId: string): Promise<void> {
        const replies = await DiscussionReplyModel.find({ post_id: postId, isDeleted: false });

        for (const reply of replies) {
            await this.softDeleteRepliesByParent(String(reply._id)); // Ép kiểu _id thành string
        }

        await DiscussionReplyModel.updateMany({ post_id: postId }, { isDeleted: true });
    }

    // Soft delete tất cả các reply liên quan đến parent_reply_id
    static async softDeleteRepliesByParent(parentReplyId: string): Promise<void> {
        const replies = await DiscussionReplyModel.find({ parent_reply_id: parentReplyId, isDeleted: false });

        for (const reply of replies) {
            await this.softDeleteRepliesByParent(String(reply._id)); // Ép kiểu _id thành string
        }

        await DiscussionReplyModel.updateMany({ parent_reply_id: parentReplyId }, { isDeleted: true });
    }

    // Soft delete một reply cụ thể
    static async deleteReply(replyId: string): Promise<DiscussionReplyInterface | null> {
        const reply = await DiscussionReplyModel.findById(replyId);
        if (!reply) {
            throw new HttpError("Reply not found", 404, "REPLY_NOT_FOUND");
        }
        return DiscussionReplyModel.findByIdAndUpdate(replyId, {isDeleted: true}, {new: true});
    }
}