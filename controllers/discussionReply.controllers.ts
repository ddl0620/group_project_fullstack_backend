import { Request, Response, NextFunction } from "express";
import { DiscussionReplyService } from "../services/discussionReply.service";
import { HttpResponse } from "../helpers/HttpResponse";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import {HttpError} from "../helpers/httpsError.helpers";

export class DiscussionReplyController {
    // Tạo bình luận mới
    static async createReply(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { content, parent_reply_id, images } = req.body;
            const { postId } = req.params;
            const creator_id = req.user?.userId;

            if (!creator_id) {
                throw new HttpError("Creator ID is required", 400, "CREATOR_ID_REQUIRED");
            }


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

    // Lấy danh sách bình luận
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

    // Lấy chi tiết bình luận
    static async getReplyById(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { replyId } = req.params;

            const reply = await DiscussionReplyService.getReplyById(replyId);

            HttpResponse.sendYES(res, 200, "Reply fetched successfully", { reply });
        } catch (err) {
            next(err);
        }
    }

    // Cập nhật bình luận
    static async updateReply(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { replyId } = req.params;
            const { content, images } = req.body;

            const reply = await DiscussionReplyService.updateReply(replyId, { content, images });
            

            HttpResponse.sendYES(res, 200, "Reply updated successfully", { reply });
        } catch (err) {
            next(err);
        }
    }

    // Soft delete bình luận
    static async deleteReply(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { replyId } = req.params;

            const reply = await DiscussionReplyService.deleteReply(replyId);

            HttpResponse.sendYES(res, 200, "Reply deleted successfully", { reply });
        } catch (err) {
            next(err);
        }
    }
}