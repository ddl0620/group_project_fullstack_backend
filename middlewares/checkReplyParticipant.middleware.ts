import { Response, NextFunction } from "express";
import { EventModel } from "../models/event.models";
import { DiscussionPostModel } from "../models/discussionPost.model";
import { DiscussionReplyModel } from "../models/discussionReply.model";
import { HttpError } from "../helpers/httpsError.helpers";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import mongoose from "mongoose";

/**
 * Discussion Reply Access Control Middleware
 * 
 * Verifies that the authenticated user has permission to access or interact with
 * discussion replies within an event. This middleware:
 * 
 * 1. Validates the format of provided post or reply IDs
 * 2. Resolves the associated event for the discussion content
 * 3. Verifies the user has access to the parent event as either:
 *    - The event organizer
 *    - An accepted participant of the event
 * 
 * The middleware handles two access paths:
 * - Direct access via postId (for creating new replies or accessing all replies)
 * - Indirect access via replyId (for updating, deleting or viewing a specific reply)
 * 
 * It also enriches the request by adding the eventId to req.params for downstream use.
 * 
 * @param req - Extended Express request with authentication properties and discussion parameters
 * @param res - Express response object (unused but required by Express middleware signature)
 * @param next - Express next middleware function
 * @returns void - Calls next middleware or error handler
 * 
 * @throws HttpError(400) - If post or reply ID format is invalid
 * @throws HttpError(404) - If the specified post or reply cannot be found
 * @throws HttpError(403) - If user is not authorized to access the parent event
 */
export const checkReplyParticipant = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    try {
        console.log("Middleware checkReplyParticipant called");

        let { postId, replyId } = req.params;

        // Kiểm tra giá trị nào được truyền vào
        if (postId) {
            console.log("postId provided:", postId);
        }
        if (replyId) {
            console.log("replyId provided:", replyId);
        }

        const userId = req.user?.userId;

        // Loại bỏ dấu `:` nếu có
        if (postId && postId.startsWith(":")) {
            postId = postId.slice(1);
        }
        if (replyId && replyId.startsWith(":")) {
            replyId = replyId.slice(1);
        }

        // Kiểm tra định dạng ObjectId
        if (postId && !mongoose.Types.ObjectId.isValid(postId)) {
            throw new HttpError("Invalid post ID format", 400, "INVALID_POST_ID");
        }
        if (replyId && !mongoose.Types.ObjectId.isValid(replyId)) {
            throw new HttpError("Invalid reply ID format", 400, "INVALID_REPLY_ID");
        }

        // Lấy postId từ replyId nếu cần
        let resolvedPostId = postId;
        if (replyId) {
            const reply = await DiscussionReplyModel.findById(replyId);
            if (!reply) {
                throw new HttpError("Reply not found", 404, "REPLY_NOT_FOUND");
            }

            resolvedPostId = reply.post_id.toString();
        }

        // Lấy eventId từ postId
        const post = await DiscussionPostModel.findById(resolvedPostId);
        if (!post) {
            throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
        }
        req.params.eventId = post.event_id.toString(); // Truyền eventId vào req.params

        // Kiểm tra quyền truy cập sự kiện
        const event = await EventModel.findOne({
            _id: req.params.eventId,
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