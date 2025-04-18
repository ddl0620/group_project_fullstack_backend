import { Response, NextFunction } from "express";
import { EventModel } from "../models/event.models";
import { DiscussionPostModel } from "../models/discussionPost.model";
import { DiscussionReplyModel } from "../models/discussionReply.model";
import { HttpError } from "../helpers/httpsError.helpers";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import { DiscussionPostInterface } from "../interfaces/discussionPost.interfaces";
import mongoose from "mongoose";

export const checkReplyParticipant = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    try {
        const { postId, replyId } = req.params;
        const userId = req.user?.userId;

        // Kiểm tra userId
        if (!userId) {
            throw new HttpError("User ID is missing", 401, "USER_ID_MISSING");
        }

        // Kiểm tra định dạng ObjectId
        if (replyId && !mongoose.Types.ObjectId.isValid(replyId)) {
            throw new HttpError("Invalid reply ID format", 400, "INVALID_REPLY_ID");
        }
        if (postId && !mongoose.Types.ObjectId.isValid(postId)) {
            throw new HttpError("Invalid post ID format", 400, "INVALID_POST_ID");
        }

        // Lấy postId từ replyId nếu cần
        let resolvedPostId = postId;
        if (replyId) {
            const reply = await DiscussionReplyModel.findById(replyId).populate("post_id");
            if (!reply) {
                throw new HttpError("Reply not found", 404, "REPLY_NOT_FOUND");
            }

            // Kiểm tra kiểu dữ liệu của post_id
            if (typeof reply.post_id === "object" && "_id" in reply.post_id) {
                const populatedPost = reply.post_id as DiscussionPostInterface;
                resolvedPostId = populatedPost._id.toString();
            } else {
                throw new HttpError("Post not found in reply", 404, "POST_NOT_FOUND_IN_REPLY");
            }
        }

        // Lấy eventId từ postId
        const post = await DiscussionPostModel.findById(resolvedPostId).populate("event_id");
        if (!post) {
            throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
        }
        const eventId = post.event_id.toString();

        // Kiểm tra quyền truy cập sự kiện
        const event = await EventModel.findOne({
            _id: eventId,
            isDeleted: false,
            $or: [
                { organizer: userId },
                { "participants": { $elemMatch: { userId, status: "ACCEPTED" } } }
            ]
        });

        if (!event) {
            throw new HttpError("You are not authorized to access this event", 403, "UNAUTHORIZED");
        }

        next();
    } catch (err) {
        next(err);
    }
};