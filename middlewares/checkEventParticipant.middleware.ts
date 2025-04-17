import { Response, NextFunction } from "express";
import { EventModel } from "../models/event.models";
import { HttpError } from "../helpers/httpsError.helpers";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import { DiscussionPostModel } from "../models/discussionPost.model";
import { DiscussionReplyModel } from "../models/discussionReply.model";

export const checkEventParticipant = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.userId;

        // Kiểm tra quyền truy cập sự kiện
        const event = await EventModel.findOne({
            _id: eventId,
            $or: [
                { organizer: userId },
                { "participants.userId": userId }
            ]
        });

        if (!event) {
            throw new HttpError("You are not authorized to access this event", 403, "UNAUTHORIZED");
        }

        // Kiểm tra quyền truy cập bài viết
        if (req.params.postId) {
            const post = await DiscussionPostModel.findById(req.params.postId);
            if (!post || post.event_id.toString() !== eventId) {
                throw new HttpError("You are not authorized to access this post", 403, "UNAUTHORIZED");
            }
        }

        // Kiểm tra quyền truy cập bình luận
        if (req.params.replyId) {
            const reply = await DiscussionReplyModel.findById(req.params.replyId).populate<{ post_id: { event_id: string } }>("post_id");
            if (!reply || !reply.post_id || reply.post_id.event_id.toString() !== eventId) {
                throw new HttpError("You are not authorized to access this reply", 403, "UNAUTHORIZED");
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};