import { Response, NextFunction } from 'express';
import { DiscussionPostService } from '../services/discussionPost.service';
import { HttpResponse } from '../helpers/HttpResponse';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { HttpError } from '../helpers/httpsError.helpers';
import mongoose from 'mongoose';
import { DiscussionReplyService } from '../services/discussionReply.service';
import { ImageUploadService } from '../services/imageUpload.service';
import { createPostSchema, updatePostSchema } from '../validation/discussionPost.validation';
import { NotificationService } from '../services/notification.service';
import { EventModel } from '../models/event.models';
import { EventInterface } from '../interfaces/event.interfaces';
import { validateInput } from '../helpers/validateInput';

/**
 * DiscussionPostController
 * 
 * This controller handles all operations related to discussion posts within events, including:
 * - Creating new discussion posts with optional image attachments
 * - Retrieving posts with pagination
 * - Fetching individual posts by ID
 * - Updating existing posts (content and images)
 * - Soft deleting posts and related data
 * 
 * All endpoints require authentication through AuthenticationRequest.
 */
// import multer from 'multer';
export class DiscussionPostController {
    /**
     * Creates a new discussion post for an event
     * 
     * This endpoint validates the post data, processes any attached images,
     * and creates a new discussion post associated with the specified event.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information and post data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.eventId - ID of the event to create the post for
     * @param {string} req.user.userId - ID of the authenticated user creating the post
     * @param {Express.Multer.File[]} req.files - Array of uploaded image files
     * @returns {Promise<void>} - Returns the created post through HttpResponse
     */
    // Tạo bài viết
    static async createPost(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            validateInput(createPostSchema, req.body);

            const { eventId } = req.params;
            const creator_id: string = req.user?.userId as string;
            const files = req.files as Express.Multer.File[];

            // Tạo bài viết trước
            const post = await DiscussionPostService.createPost(
                {
                    ...req.body,
                    creator_id,
                    event_id: eventId,
                },
                files,
            );

            HttpResponse.sendYES(res, 201, 'Post created successfully', { post: post });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves discussion posts for a specific event with pagination
     * 
     * This endpoint fetches posts associated with the specified event,
     * supporting pagination through page and limit query parameters.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.eventId - ID of the event to fetch posts for
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of posts per page (default: 10)
     * @returns {Promise<void>} - Returns paginated posts through HttpResponse
     */
    static async getPosts(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { eventId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const posts = await DiscussionPostService.getPosts(eventId, page, limit);
            HttpResponse.sendYES(res, 200, 'Posts fetched successfully', { posts });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves a specific discussion post by its ID
     * 
     * This endpoint fetches a single post based on the provided post ID.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.postId - ID of the post to fetch
     * @returns {Promise<void>} - Returns the requested post through HttpResponse
     */
    static async getPostById(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;
            const post = await DiscussionPostService.getPostById(postId);
            HttpResponse.sendYES(res, 200, 'Post fetched successfully', { post });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Updates an existing discussion post
     * 
     * This endpoint validates the update data, processes any new or removed images,
     * and updates the specified post with the new content and images.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information and update data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.postId - ID of the post to update
     * @param {string} req.body.content - Updated content for the post
     * @param {string[]} req.body.existingImages - Array of image IDs to retain
     * @param {Express.Multer.File[]} req.files - Array of new uploaded image files
     * @returns {Promise<void>} - Returns the updated post through HttpResponse
     */
    static async updatePost(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { error } = updatePostSchema.validate(req.body);
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const { postId } = req.params;
            const { content, existingImages } = req.body;
            const files = req.files as Express.Multer.File[] | undefined;

            // Update post
            const post = await DiscussionPostService.updatePost(postId, files, existingImages, {
                content,
            });

            HttpResponse.sendYES(res, 200, 'Post updated successfully', { post });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Soft deletes a discussion post and its related data
     * 
     * This endpoint marks a post as deleted (isDeleted: true) along with
     * all associated replies and images, without permanently removing data.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.postId - ID of the post to delete
     * @returns {Promise<void>} - Returns confirmation of deletion through HttpResponse
     */
    static async deletePost(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { postId } = req.params;

            // Kiểm tra định dạng postId
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                throw new HttpError('Invalid post ID format', 400, 'INVALID_POST_ID');
            }

            // Đánh dấu bài viết là isDeleted: true
            const post = await DiscussionPostService.deletePost(postId);
            if (!post) {
                throw new HttpError('Post not found', 404, 'POST_NOT_FOUND');
            }

            // Đánh dấu tất cả các reply liên quan đến post_id là isDeleted: true
            await DiscussionReplyService.softDeleteRepliesByPost(postId);

            // Đánh dấu tất cả các hình ảnh liên quan đến post_id là isDeleted: true
            // await ImageDiscussionService.softDeleteImagesByReference(postId, "post");

            HttpResponse.sendYES(res, 200, 'Post and related data soft deleted successfully', {
                post,
            });
        } catch (err) {
            next(err);
        }
    }
}
