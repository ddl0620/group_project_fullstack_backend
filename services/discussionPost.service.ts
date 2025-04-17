import { DiscussionPostInterface } from "../interfaces/discussionPost.interfaces";
import { DiscussionPostModel } from "../models/discussionPost.model";
import { CreatePostInput, UpdatePostInput } from "../types/discussionPost.type";
import { HttpError } from '../helpers/httpsError.helpers';

export class DiscussionPostService {
    // Tạo bài viết mới
    static async createPost(data: CreatePostInput): Promise<DiscussionPostInterface> {
        return await DiscussionPostModel.create(data);
    }

    // Lấy danh sách bài viết (chỉ lấy bài viết chưa bị xóa)
    static async getPosts(event_id: string, page: number, limit: number): Promise<DiscussionPostInterface[]> {
        const skip = (page - 1) * limit;
        return await DiscussionPostModel.find({ event_id, isDeleted: false })
            .populate("creator_id", "username")
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });
    }

    // Lấy chi tiết bài viết
    static async getPostById(post_id: string): Promise<DiscussionPostInterface | null> {
        return await DiscussionPostModel.findOne({ _id: post_id, isDeleted: false }).populate("creator_id", "username");
    }

    // Cập nhật bài viết
    static async updatePost(post_id: string, updateData: UpdatePostInput): Promise<DiscussionPostInterface | null> {
        return await DiscussionPostModel.findByIdAndUpdate(post_id, updateData, { new: true });
    }

    // Soft delete bài viết
    static async deletePost(post_id: string): Promise<DiscussionPostInterface | null> {
        const post = await DiscussionPostModel.findById(post_id);
        if (!post) {
            throw new HttpError('Failed to delete post', 500, 'DELETE_POST_FAILED');
        }
        return await DiscussionPostModel.findByIdAndUpdate(
            post_id,
            { isDeleted: true },
            { new: true }
        );
    }
}