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
        // Kiểm tra định dạng event_id
        if (!event_id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new HttpError("Invalid event ID format", 400, "INVALID_EVENT_ID");
        }

        const skip = (page - 1) * limit;

        const posts = await DiscussionPostModel.find({ event_id, isDeleted: false })
            .populate("creator_id", "username")
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });

        if (!posts || posts.length === 0) {
            throw new HttpError("No posts found for this event", 404, "NO_POSTS_FOUND");
        }

        return posts;
    }

    // Lấy chi tiết bài viết
    static async getPostById(postId: string): Promise<DiscussionPostInterface | null> {
        return await DiscussionPostModel.findById(postId).exec();
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