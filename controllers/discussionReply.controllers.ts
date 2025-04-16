import { Request, Response, NextFunction } from "express";
import { DiscussionReplyService } from "../services/discussionReply.service";
import { HttpResponse } from "../helpers/HttpResponse";

export class DiscussionReplyController {
    static async createReply(req: Request, res: Response, next: NextFunction) {
        try {
            const { content, parent_reply_id, images } = req.body;
            const { postId } = req.params;
            const creator_id = req.user?.userId;

            const reply = await DiscussionReplyService.createReply({
                content,
                images,
                creator_id,
                post_id: postId,
                parent_reply_id,
            });
            HttpResponse.sendYES(res, 201, "Reply created successfully", { reply });
        } catch (err) {
            next(err);
        }
    }

    static async getReplies(req: Request, res: Response, next: NextFunction) {
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

    static async getReplyById(req: Request, res: Response, next: NextFunction) {
        try {
            const { replyId } = req.params;

            const reply = await DiscussionReplyService.getReplyById(replyId);
            if (!reply) {
                return HttpResponse.sendNO(res, 404, "Reply not found");
            }

            HttpResponse.sendYES(res, 200, "Reply fetched successfully", { reply });
        } catch (err) {
            next(err);
        }
    }

    static async updateReply(req: Request, res: Response, next: NextFunction) {
        try {
            const { replyId } = req.params;
            const { content, images } = req.body;

            const reply = await DiscussionReplyService.updateReply(replyId, { content, images });
            if (!reply) {
                return HttpResponse.sendNO(res, 404, "Reply not found");
            }

            HttpResponse.sendYES(res, 200, "Reply updated successfully", { reply });
        } catch (err) {
            next(err);
        }
    }

    static async deleteReply(req: Request, res: Response, next: NextFunction) {
        try {
            const { replyId } = req.params;

            const reply = await DiscussionReplyService.deleteReply(replyId);
            if (!reply) {
                return HttpResponse.sendNO(res, 404, "Reply not found");
            }

            HttpResponse.sendYES(res, 200, "Reply deleted successfully", { reply });
        } catch (err) {
            next(err);
        }
    }
}