import {Response, NextFunction } from "express";
import { DiscussionPostService } from "../services/discussionPost.service";
import { HttpResponse } from "../helpers/HttpResponse";
import { ImageDiscussionService } from "../services/imageDiscussion.service";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import {HttpError} from "../helpers/httpsError.helpers";

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

            const post = await DiscussionPostService.getPostById(postId);

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

    static async deletePost(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;
    
            // Xóa bài viết
            const post = await DiscussionPostService.deletePost(postId);
        
            // Xóa hình ảnh liên quan
            
            await ImageDiscussionService.deleteImagesByReference(postId, "post");
    
            HttpResponse.sendYES(res, 200, "Post deleted successfully", { post });
        } catch (err) {
            next(err);
        }
    }
}