import { DiscussionPostInterface } from '../interfaces/discussionPost.interfaces';
import { DiscussionPostModel } from '../models/discussionPost.model';
import { CreatePostInput, UpdatePostInput } from '../types/discussionPost.type';
import { HttpError } from '../helpers/httpsError.helpers';
import { ImageUploadService } from './imageUpload.service';
import { EventInterface } from '../interfaces/event.interfaces';
import { EventModel } from '../models/event.models';
import { NotificationService } from './notification.service';
import mongoose from 'mongoose';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';

/**
 * Discussion Post Service
 * 
 * This service handles operations related to discussion posts within events,
 * including creation, retrieval, updating, and deletion of posts. It also
 * manages associated images and notifications.
 */
export class DiscussionPostService {

     /**
     * Creates a new discussion post
     * 
     * Creates a post for a specific event, uploads any associated images,
     * and sends notifications to event participants.
     * 
     * @param {CreatePostInput} data - Post data including content and event ID
     * @param {Express.Multer.File[]} files - Image files to be uploaded with the post
     * @returns {Promise<DiscussionPostInterface>} The created post object
     * @throws {HttpError} If the event doesn't exist or post creation fails
     */
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
            throw new HttpError(
                'Event not found ',
                StatusCode.NOT_FOUND,
                ErrorCode.EVENT_NOT_FOUND,
            );
        }

        data.images = await ImageUploadService.convertFileToURL(
            files,
            'discussionPost',
            data.creator_id as string,
        );

        const post: DiscussionPostInterface | null = await DiscussionPostModel.create(data);
        if (!post) {
            throw new HttpError(
                `Failed to create post`,
                StatusCode.NOT_FOUND,
                ErrorCode.CAN_NOT_CREATE,
            );
        }

        const userIds: string[] =
            event?.participants?.map(member => member.userId.toString()) || [];
        await NotificationService.createNotification({
            ...NotificationService.newPostNotificationContent(event?.title as string),
            userIds,
        });
        return post;
    }

     /**
     * Retrieves posts for a specific event with pagination
     * 
     * Gets non-deleted posts for the specified event, sorted by creation date
     * in descending order (newest first).
     * 
     * @param {string} event_id - ID of the event to get posts for
     * @param {number} page - Page number for pagination
     * @param {number} limit - Number of posts per page
     * @returns {Promise<DiscussionPostInterface[]>} Array of posts
     * @throws {HttpError} If no posts are found for the event
     */
    // Lấy danh sách bài viết (chỉ lấy bài viết chưa bị xóa)
    static async getPosts(
        event_id: string,
        page: number,
        limit: number,
    ): Promise<DiscussionPostInterface[]> {
        const skip: number = (page - 1) * limit;

        const posts = await DiscussionPostModel.find({ event_id, isDeleted: false })
            .populate('creator_id', 'username')
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });

        if (!posts) {
            throw new HttpError(
                'No posts found for this event',
                StatusCode.NOT_FOUND,
                ErrorCode.POST_NOT_FOUND,
            );
        }

        return posts;
    }

    /**
     * Retrieves a specific post by ID
     * 
     * Gets detailed information about a single post.
     * 
     * @param {string} postId - ID of the post to retrieve
     * @returns {Promise<DiscussionPostInterface | null>} The post object or null if not found
     * @throws {HttpError} If the post ID format is invalid
     */
    // Lấy chi tiết bài viết
    static async getPostById(postId: string): Promise<DiscussionPostInterface | null> {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new HttpError(
                'Invalid post ID format',
                StatusCode.NOT_FOUND,
                ErrorCode.INVALID_ID,
            );
        }

        return await DiscussionPostModel.findById(postId).exec();
    }

    /**
     * Updates an existing post
     * 
     * Updates post content and manages associated images, including
     * adding new images and removing deleted ones.
     * 
     * @param {string} post_id - ID of the post to update
     * @param {Express.Multer.File[] | undefined} files - New image files to upload
     * @param {string[]} existingImages - URLs of images to keep
     * @param {UpdatePostInput} updateData - New post data
     * @returns {Promise<DiscussionPostInterface | null>} The updated post
     * @throws {HttpError} If the post doesn't exist
     */
    // Cập nhật bài viết
    static async updatePost(
        post_id: string,
        files: Express.Multer.File[] | undefined,
        existingImages: string[],
        updateData: UpdatePostInput,
    ): Promise<DiscussionPostInterface | null> {
        const currentPost: DiscussionPostInterface | null =
            await DiscussionPostService.getPostById(post_id);
        if (!currentPost) {
            throw new HttpError('Post not found', StatusCode.NOT_FOUND, ErrorCode.POST_NOT_FOUND);
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

    /**
     * Soft deletes a post
     * 
     * Marks a post as deleted without physically removing it from the database.
     * 
     * @param {string} post_id - ID of the post to delete
     * @returns {Promise<DiscussionPostInterface | null>} The updated post with isDeleted=true
     * @throws {HttpError} If the post doesn't exist or deletion fails
     */
    // Soft delete bài viết
    static async deletePost(post_id: string): Promise<DiscussionPostInterface | null> {
        const post: DiscussionPostInterface | null = await DiscussionPostModel.findById(post_id);
        if (!post) {
            throw new HttpError(
                'Failed to delete post',
                StatusCode.BAD_REQUEST,
                ErrorCode.DELETE_FAILED,
            );
        }
        return DiscussionPostModel.findByIdAndUpdate(post_id, { isDeleted: true }, { new: true });
    }
}
