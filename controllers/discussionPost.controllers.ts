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
// import multer from 'multer';
export class DiscussionPostController {
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

    static async getPostById(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;
            const post = await DiscussionPostService.getPostById(postId);
            HttpResponse.sendYES(res, 200, 'Post fetched successfully', { post });
        } catch (err) {
            next(err);
        }
    }

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
