import { DiscussionReplyInterface } from "../interfaces/discussionReply.interface";
import { DiscussionReplyModel } from "../models/discussionReply.model";

export class DiscussionReplyService {
    static async createReply(data: DiscussionReplyInterface): Promise<DiscussionReplyInterface>{
        return await DiscussionReplyModel.create(data);
    }

    static async getReplies(post_id: string, page: number, limit: number): Promise<DiscussionReplyInterface[]> {
        const skip = (page - 1) * limit;
        return await DiscussionReplyModel.find({ post_id })
            .populate("creator_id", "username")
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });
    }

    static async getReplyById(reply_id: string): Promise<DiscussionReplyInterface | null> {
        return await DiscussionReplyModel.findById(reply_id).populate("creator_id", "username");
    }

    static async updateReply(reply_id: string, updateData: Partial<DiscussionReplyInterface>): Promise<DiscussionReplyInterface | null> {
        return await DiscussionReplyModel.findByIdAndUpdate(reply_id, updateData, { new: true, runValidators: true });
    }

    static async deleteReply(reply_id: string): Promise<DiscussionReplyInterface | null> {
        return await DiscussionReplyModel.findByIdAndDelete(reply_id);
    }
}