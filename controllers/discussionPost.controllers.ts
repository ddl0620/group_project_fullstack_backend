import { Request, Response, NextFunction } from "express";
import { DiscussionPostService } from "../services/discussionPost.service";
import { HttpResponse } from "../helpers/HttpResponse";

export class DiscussionPostController {
    static async createPost(req: Request, res: Response, next: NextFunction) {
        try {
            const { content, images } = req.body;
            const { eventId } = req.params;
            const creator_id = req.user?.userId;

            const post = await DiscussionPostService.createPost({ content, images, creator_id, event_id: eventId });
            HttpResponse.sendYES(res, 201, "Post created successfully", { post });
        } catch (err) {
            next(err);
        }
    }

    static async getPosts(req: Request, res: Response, next: NextFunction) {
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

    static async getPostById(req: Request, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;

            const post = await DiscussionPostService.getPostById(postId);
            if (!post) {
                return HttpResponse.sendNO(res, 404, "Post not found");
            }

            HttpResponse.sendYES(res, 200, "Post fetched successfully", { post });
        } catch (err) {
            next(err);
        }
    }

    static async updatePost(req: Request, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;
            const { content, images } = req.body;

            const post = await DiscussionPostService.updatePost(postId, { content, images });
            if (!post) {
                return HttpResponse.sendNO(res, 404, "Post not found");
            }

            HttpResponse.sendYES(res, 200, "Post updated successfully", { post });
        } catch (err) {
            next(err);
        }
    }

    static async deletePost(req: Request, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;

            const post = await DiscussionPostService.deletePost(postId);
            if (!post) {
                return HttpResponse.sendNO(res, 404, "Post not found");
            }

            HttpResponse.sendYES(res, 200, "Post deleted successfully", { post });
        } catch (err) {
            next(err);
        }
    }
}