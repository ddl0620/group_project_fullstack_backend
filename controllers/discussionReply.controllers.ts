import { Response, NextFunction } from 'express';
import { DiscussionReplyService } from '../services/discussionReply.service';
import { HttpResponse } from '../helpers/HttpResponse';
import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { HttpError } from '../helpers/httpsError.helpers';
import mongoose from 'mongoose';
import { ImageUploadService } from '../services/imageUpload.service';
import { createReplySchema, updateReplySchema } from '../validation/discussionReply.validation';
import { NotificationService } from '../services/notification.service';
import { UserModel } from '../models/user.models';
import { UserInterface } from '../interfaces/user.interfaces';
import { DiscussionPostInterface } from '../interfaces/discussionPost.interfaces';
import { DiscussionPostModel } from '../models/discussionPost.model';
import { EventInterface } from '../interfaces/event.interfaces';
import { EventModel } from '../models/event.models';

/**
 * DiscussionReplyController
 * 
 * This controller handles all operations related to replies within discussion posts, including:
 * - Creating new replies with optional image attachments and parent-child relationships
 * - Retrieving replies with pagination
 * - Fetching individual replies by ID
 * - Updating existing replies (content and images)
 * - Soft deleting replies and their child replies
 * 
 * The controller also manages notifications for replies and comments.
 * All endpoints require authentication through AuthenticationRequest.
 */
export class DiscussionReplyController {
    /**
     * Creates a new reply to a discussion post or to another reply
     * 
     * This endpoint validates the reply data, processes any attached images,
     * creates a new reply, and sends notifications to relevant users.
     * It supports both direct replies to posts and nested replies to other replies.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information and reply data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.body.content - Content of the reply
     * @param {string|null} req.body.parent_reply_id - ID of the parent reply (if replying to another reply)
     * @param {string} req.params.postId - ID of the post being replied to
     * @param {string} req.user.userId - ID of the authenticated user creating the reply
     * @param {Express.Multer.File[]} req.files - Array of uploaded image files
     * @returns {Promise<void>} - Returns the created reply through HttpResponse and sends notifications
     */
    static async createReply(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { content, parent_reply_id } = req.body;
            const files = req.files as Express.Multer.File[] | undefined;
            const { postId } = req.params;
            const creator_id = req.user?.userId;

            // Normalize parent_reply_id
            const normalizedParentReplyId =
                parent_reply_id === 'null' ||
                parent_reply_id === '' ||
                parent_reply_id === undefined
                    ? null
                    : parent_reply_id;

            // Validate request body
            const { error } = createReplySchema.validate({
                content,
                parent_reply_id: normalizedParentReplyId,
            });
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            if (!creator_id) {
                throw new HttpError('Creator ID is required', 400, 'CREATOR_ID_REQUIRED');
            }

            let imageUrls: string[] = [];
            if (files && files.length > 0) {
                const uploadInputs = files.map(file => ({
                    file: file.path,
                    folder: `discussionReplies/${postId}/${creator_id}`,
                }));
                imageUrls = await ImageUploadService.uploadImages(uploadInputs);
            }

            const reply = await DiscussionReplyService.createReply({
                content,
                images: imageUrls,
                creator_id,
                post_id: postId,
                parent_reply_id: normalizedParentReplyId,
            });

            HttpResponse.sendYES(res, 201, 'Reply created successfully', { reply });

            const discusisonPost: DiscussionPostInterface | null =
                await DiscussionPostModel.findById(postId);

            const creatorId = discusisonPost?.creator_id;
            const postCreator: UserInterface | null =
                await UserModel.findById(creatorId).select('name');
            const commenter: UserInterface | null = await UserModel.findById(
                req.user?.userId,
            ).select('name');

            const eventId = discusisonPost?.event_id;
            const event: EventInterface | null = await EventModel.findById(eventId).select('title');

            let notificationContent;
            if (!mongoose.isValidObjectId(parent_reply_id)) {
                notificationContent = NotificationService.commentNotificationContent(
                    event?.title || 'Event',
                    commenter?.name || 'Commenter',
                    postCreator?.name || 'Post Creator',
                );
            } else {
                notificationContent = NotificationService.replyNotificationContent(
                    event?.title || 'Event',
                    commenter?.name || 'Commenter',
                    postCreator?.name || 'Post Creator',
                );
            }
            await NotificationService.createNotification({
                ...notificationContent,
                userIds: [discusisonPost?.creator_id.toString() || ''],
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves replies for a specific discussion post with pagination
     * 
     * This endpoint fetches replies associated with the specified post,
     * supporting pagination through page and limit query parameters.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.postId - ID of the post to fetch replies for
     * @param {number} req.query.page - Page number for pagination (default: 1)
     * @param {number} req.query.limit - Number of replies per page (default: 10)
     * @returns {Promise<void>} - Returns paginated replies through HttpResponse
     */
    static async getReplies(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { postId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const replies = await DiscussionReplyService.getReplies(postId, page, limit);
            HttpResponse.sendYES(res, 200, 'Replies fetched successfully', { replies });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Retrieves a specific reply by its ID
     * 
     * This endpoint fetches a single reply based on the provided reply ID.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.replyId - ID of the reply to fetch
     * @returns {Promise<void>} - Returns the requested reply through HttpResponse
     */
    static async getReplyById(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { replyId } = req.params;

            const reply = await DiscussionReplyService.getReplyById(replyId);

            HttpResponse.sendYES(res, 200, 'Reply fetched successfully', { reply });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Updates an existing reply
     * 
     * This endpoint validates the update data, processes any new or removed images,
     * and updates the specified reply with the new content and images.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information and update data
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.replyId - ID of the reply to update
     * @param {string} req.body.content - Updated content for the reply
     * @param {string[]} req.body.existingImages - Array of image URLs to retain
     * @param {Express.Multer.File[]} req.files - Array of new uploaded image files
     * @returns {Promise<void>} - Returns the updated reply through HttpResponse
     */
    static async updateReply(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { error } = updateReplySchema.validate(req.body);
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const { replyId } = req.params;
            const { content, existingImages } = req.body;
            const files = req.files as Express.Multer.File[] | undefined;

            const currentReply = await DiscussionReplyService.getReplyById(replyId);
            if (!currentReply) {
                throw new HttpError('Reply not found', 404, 'REPLY_NOT_FOUND');
            }

            let retainedImages: string[] = [];
            if (existingImages) {
                try {
                    retainedImages = Array.isArray(existingImages)
                        ? existingImages
                        : typeof existingImages === 'string'
                          ? JSON.parse(existingImages)
                          : [];
                    if (!Array.isArray(retainedImages)) {
                        throw new Error('existingImages must be an array');
                    }
                } catch (err) {
                    throw new HttpError(
                        'Invalid existingImages format',
                        400,
                        'INVALID_EXISTING_IMAGES',
                    );
                }
            }

            const removedImages = (currentReply.images || []).filter(
                url => !retainedImages.includes(url),
            );

            let newImageUrls: string[] = [];
            if (files && files.length > 0) {
                const uploadInputs = files.map(file => ({
                    file: file.path,
                    folder: `discussionReplies/${currentReply.post_id}/${currentReply.creator_id}`,
                }));
                newImageUrls = await ImageUploadService.uploadImages(uploadInputs);
            }

            const updatedImages = [...retainedImages, ...newImageUrls];

            const reply = await DiscussionReplyService.updateReply(replyId, {
                content,
                images: updatedImages.length > 0 ? updatedImages : [],
            });

            if (removedImages.length > 0) {
                await ImageUploadService.deleteImages(
                    removedImages,
                    `discussionReplies/${currentReply.post_id}/${currentReply.creator_id}`,
                );
            }

            HttpResponse.sendYES(res, 200, 'Reply updated successfully', { reply });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Soft deletes a reply and its child replies
     * 
     * This endpoint marks a reply as deleted (isDeleted: true) along with
     * all child replies, without permanently removing data from the database.
     * 
     * @param req - AuthenticationRequest object containing authenticated user information
     * @param res - Express Response object
     * @param next - Express NextFunction for error handling
     * 
     * @param {string} req.params.replyId - ID of the reply to delete
     * @returns {Promise<void>} - Returns confirmation of deletion through HttpResponse
     */
    static async deleteReply(
        req: AuthenticationRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { replyId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(replyId)) {
                throw new HttpError('Invalid reply ID format', 400, 'INVALID_REPLY_ID');
            }

            const reply = await DiscussionReplyService.deleteReply(replyId);
            if (!reply) {
                throw new HttpError('Reply not found', 404, 'REPLY_NOT_FOUND');
            }

            await DiscussionReplyService.softDeleteRepliesByParent(replyId);

            HttpResponse.sendYES(res, 200, 'Reply and related data soft deleted successfully', {
                reply,
            });
        } catch (err) {
            next(err);
        }
    }
}
