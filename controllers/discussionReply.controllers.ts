import { Response, NextFunction } from "express";
import { DiscussionReplyService } from "../services/discussionReply.service";
import { HttpResponse } from "../helpers/HttpResponse";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import { HttpError } from "../helpers/httpsError.helpers";
import mongoose from "mongoose";
import { ImageDiscussionService } from "../services/imageDiscussion.service";

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

            // Kiểm tra định dạng replyId
            if (!mongoose.Types.ObjectId.isValid(replyId)) {
                throw new HttpError("Invalid reply ID format", 400, "INVALID_REPLY_ID");
            }

            // Đánh dấu reply là isDeleted: true
            const reply = await DiscussionReplyService.deleteReply(replyId);
            if (!reply) {
                throw new HttpError("Reply not found", 404, "REPLY_NOT_FOUND");
            }

            // Đánh dấu tất cả các reply liên quan đến parent_reply_id là isDeleted: true
            await DiscussionReplyService.softDeleteRepliesByParent(replyId);

            // Đánh dấu tất cả các hình ảnh liên quan đến reply_id là isDeleted: true
            // await ImageDiscussionService.softDeleteImagesByReference(replyId, "reply");

            HttpResponse.sendYES(res, 200, "Reply and related data soft deleted successfully", { reply });
        } catch (err) {
            next(err);
        }
    }
}