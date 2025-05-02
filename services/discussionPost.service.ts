import { DiscussionPostInterface } from '../interfaces/discussionPost.interfaces';
import { DiscussionPostModel } from '../models/discussionPost.model';
import { CreatePostInput, UpdatePostInput } from '../types/discussionPost.type';
import { HttpError } from '../helpers/httpsError.helpers';
import { ImageUploadService } from './imageUpload.service';
import { EventInterface } from '../interfaces/event.interfaces';
import { EventModel } from '../models/event.models';
import { NotificationService } from './notification.service';
import mongoose from 'mongoose';

export class DiscussionPostService {
    // Tạo bài viết mới
    static async createPost(
        data: CreatePostInput,
        files: Express.Multer.File[],
    ): Promise<DiscussionPostInterface> {
        const event: EventInterface | null = await EventModel.findOne({
            _id: data.event_id,
            isDeleted: false,
        });

        if (!event) {
            throw new HttpError('Event not found. Cannot ', 404, 'EVENT_NOT_FOUND');
        }

        data.images = await ImageUploadService.convertFileToURL(
            files,
            'discussionPost',
            data.creator_id as string,
        );

        const post = await DiscussionPostModel.create(data);
        if (!post) {
            throw new HttpError(`Failed to create post`);
        }

        if (!post) {
            throw new HttpError('Failed to update post with images');
        }

        const userIds: string[] =
            event?.participants?.map(member => member.userId.toString()) || [];
        await NotificationService.createNotification({
            ...NotificationService.newPostNotificationContent(event?.title as string),
            userIds,
        });

        return post;
    }

    // Lấy danh sách bài viết (chỉ lấy bài viết chưa bị xóa)
    static async getPosts(
        event_id: string,
        page: number,
        limit: number,
    ): Promise<DiscussionPostInterface[]> {
        // Kiểm tra định dạng event_id
        if (!event_id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new HttpError('Invalid event ID format', 400, 'INVALID_EVENT_ID');
        }

        const skip = (page - 1) * limit;

        const posts = await DiscussionPostModel.find({ event_id, isDeleted: false })
            .populate('creator_id', 'username')
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });

        if (!posts) {
            throw new HttpError('No posts found for this event', 404, 'NO_POSTS_FOUND');
        }

        return posts;
    }

    // Lấy chi tiết bài viết
    static async getPostById(postId: string): Promise<DiscussionPostInterface | null> {
        // Kiểm tra định dạng postId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new HttpError('Invalid post ID format', 400, 'INVALID_POST_ID');
        }

        return await DiscussionPostModel.findById(postId).exec();
    }

    // Cập nhật bài viết
    static async updatePost(
        post_id: string,
        files: Express.Multer.File[] | undefined,
        existingImages: string[],
        updateData: UpdatePostInput,
    ): Promise<DiscussionPostInterface | null> {
        const currentPost = await DiscussionPostService.getPostById(post_id);
        if (!currentPost) {
            throw new HttpError('Post not found', 404, 'POST_NOT_FOUND');
        }

        const updatedImages: string[] = await ImageUploadService.updateImagesList(
            files,
            existingImages,
            currentPost,
            'discussionPosts',
            post_id,
        );

        updateData.images = updatedImages || [];

        return DiscussionPostModel.findByIdAndUpdate(post_id, updateData, { new: true });
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
            { new: true },
        );
    }
}
