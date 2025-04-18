import {Response, NextFunction } from "express";
import { DiscussionPostService } from "../services/discussionPost.service";
import { HttpResponse } from "../helpers/HttpResponse";
import { ImageDiscussionService } from "../services/imageDiscussion.service";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import {HttpError} from "../helpers/httpsError.helpers";
import mongoose from "mongoose";
import { DiscussionReplyService } from "../services/discussionReply.service";

export class DiscussionPostController {
    // Tạo bài viết
    static async createPost(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { content, images } = req.body;
            const { eventId } = req.params;
            const creator_id = req.user?.userId;

            if (!creator_id){
                throw new HttpError("Creator ID is required", 400, "CREATOR_ID_REQUIRED");
            }
            
            const post = await DiscussionPostService.createPost({ content, images, creator_id, event_id: eventId });
            
            HttpResponse.sendYES(res, 201, "Post created successfully", { post });
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
            HttpResponse.sendYES(res, 200, "Posts fetched successfully", { posts });

        } catch (err) {
            next(err);
        }
    }

    static async getPostById(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;

            // Kiểm tra định dạng postId
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                throw new HttpError("Invalid post ID format", 400, "INVALID_POST_ID");
            }

            const post = await DiscussionPostService.getPostById(postId);

            if (!post) {
                throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
            }

            HttpResponse.sendYES(res, 200, "Post fetched successfully", { post });
        } catch (err) {
            next(err);
        }
    }

    static async updatePost(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;
            const { content, images } = req.body;

            const post = await DiscussionPostService.updatePost(postId, { content, images });

            HttpResponse.sendYES(res, 200, "Post updated successfully", { post });
        } catch (err) {
            next(err);
        }
    }

    static async deletePost(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { postId } = req.params;

            // Kiểm tra định dạng postId
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                throw new HttpError("Invalid post ID format", 400, "INVALID_POST_ID");
            }

            // Đánh dấu bài viết là isDeleted: true
            const post = await DiscussionPostService.deletePost(postId);
            if (!post) {
                throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
            }

            // Đánh dấu tất cả các reply liên quan đến post_id là isDeleted: true
            await DiscussionReplyService.softDeleteRepliesByPost(postId);

            // Đánh dấu tất cả các hình ảnh liên quan đến post_id là isDeleted: true
            // await ImageDiscussionService.softDeleteImagesByReference(postId, "post");

            HttpResponse.sendYES(res, 200, "Post and related data soft deleted successfully", { post });
        } catch (err) {
            next(err);
        }
    }
}