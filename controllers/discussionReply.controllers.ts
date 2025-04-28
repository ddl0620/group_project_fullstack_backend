import { Response, NextFunction } from "express";
import { DiscussionReplyService } from "../services/discussionReply.service";
import { HttpResponse } from "../helpers/HttpResponse";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import { HttpError } from "../helpers/httpsError.helpers";
import mongoose from "mongoose";
import { ImageUploadService } from "../services/imageUpload.service";
import { createReplySchema, updateReplySchema } from "../validation/discussionReply.validation";

export class DiscussionReplyController {
    static async createReply(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Log req.body for debugging
            console.log('req.body:', req.body);

            const { content, parent_reply_id } = req.body;
            const files = req.files as Express.Multer.File[] | undefined;
            const { postId } = req.params;
            const creator_id = req.user?.userId;

            // Normalize parent_reply_id
            const normalizedParentReplyId = parent_reply_id === 'null' || parent_reply_id === '' || parent_reply_id === undefined ? null : parent_reply_id;

            // Validate request body
            const { error } = createReplySchema.validate({
                content,
                parent_reply_id: normalizedParentReplyId,
            });
            if (error) {
                throw new HttpError(error.details[0].message, 400, "INVALID_INPUT");
            }

            if (!creator_id) {
                throw new HttpError("Creator ID is required", 400, "CREATOR_ID_REQUIRED");
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

            HttpResponse.sendYES(res, 201, "Reply created successfully", { reply });
        } catch (err) {
            next(err);
        }
    }

    static async getReplies(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { postId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const replies = await DiscussionReplyService.getReplies(postId, page, limit);
            HttpResponse.sendYES(res, 200, "Replies fetched successfully", { replies });
        } catch (err) {
            next(err);
        }
    }

    static async getReplyById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { replyId } = req.params;

            const reply = await DiscussionReplyService.getReplyById(replyId);

            HttpResponse.sendYES(res, 200, "Reply fetched successfully", { reply });
        } catch (err) {
            next(err);
        }
    }

    static async updateReply(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { error } = updateReplySchema.validate(req.body);
            if (error) {
                throw new HttpError(error.details[0].message, 400, "INVALID_INPUT");
            }

            const { replyId } = req.params;
            const { content, existingImages } = req.body;
            const files = req.files as Express.Multer.File[] | undefined;

            const currentReply = await DiscussionReplyService.getReplyById(replyId);
            if (!currentReply) {
                throw new HttpError("Reply not found", 404, "REPLY_NOT_FOUND");
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
                        throw new Error("existingImages must be an array");
                    }
                } catch (err) {
                    throw new HttpError("Invalid existingImages format", 400, "INVALID_EXISTING_IMAGES");
                }
            }

            const removedImages = (currentReply.images || []).filter(url => !retainedImages.includes(url));

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
                await ImageUploadService.deleteImages(removedImages, `discussionReplies/${currentReply.post_id}/${currentReply.creator_id}`);
            }

            HttpResponse.sendYES(res, 200, "Reply updated successfully", { reply });
        } catch (err) {
            next(err);
        }
    }

    static async deleteReply(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { replyId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(replyId)) {
                throw new HttpError("Invalid reply ID format", 400, "INVALID_REPLY_ID");
            }

            const reply = await DiscussionReplyService.deleteReply(replyId);
            if (!reply) {
                throw new HttpError("Reply not found", 404, "REPLY_NOT_FOUND");
            }

            await DiscussionReplyService.softDeleteRepliesByParent(replyId);

            HttpResponse.sendYES(res, 200, "Reply and related data soft deleted successfully", { reply });
        } catch (err) {
            next(err);
        }
    }
}