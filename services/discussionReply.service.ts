import { DiscussionReplyInterface } from '../interfaces/discussionReply.interfaces';
import { DiscussionReplyModel } from '../models/discussionReply.model';
import { CreateReplyInput, UpdateReplyInput } from '../types/discussionReply.type';
import { HttpError } from '../helpers/httpsError.helpers';

/**
 * Discussion Reply Service
 * 
 * This service manages operations related to replies on discussion posts,
 * including creating, retrieving, updating, and deleting replies.
 * It supports hierarchical replies (replies to replies) and maintains
 * data integrity through soft deletion.
 */
export class DiscussionReplyService {

    /**
     * Creates a new reply to a post or another reply
     * 
     * Creates a reply with optional parent_reply_id for nested replies.
     * If parent_reply_id is not provided, it's set to null (top-level reply).
     * 
     * @param {CreateReplyInput} data - Reply data including content and associations
     * @returns {Promise<DiscussionReplyInterface>} The created reply object
     */
    // Tạo bình luận mới
    static async createReply(data: CreateReplyInput): Promise<DiscussionReplyInterface> {
        const { parent_reply_id, ...rest } = data;
        return await DiscussionReplyModel.create({
            ...rest,
            parent_reply_id: parent_reply_id || null,
        });
    }

    /**
     * Retrieves replies for a specific post with pagination
     * 
     * Gets non-deleted replies for the specified post, sorted by creation date
     * in descending order (newest first).
     * 
     * @param {string} post_id - ID of the post to get replies for
     * @param {number} page - Page number for pagination
     * @param {number} limit - Number of replies per page
     * @returns {Promise<DiscussionReplyInterface[]>} Array of replies
     */
    static async getReplies(
        post_id: string,
        page: number,
        limit: number,
    ): Promise<DiscussionReplyInterface[]> {
        const skip = (page - 1) * limit;
        return DiscussionReplyModel.find({ post_id, isDeleted: false })
            .populate('creator_id', 'username')
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });
    }

    /**
     * Retrieves a specific reply by ID
     * 
     * Gets detailed information about a single reply, including creator information.
     * Only returns non-deleted replies.
     * 
     * @param {string} reply_id - ID of the reply to retrieve
     * @returns {Promise<DiscussionReplyInterface | null>} The reply object or null if not found
     */
    static async getReplyById(reply_id: string): Promise<DiscussionReplyInterface | null> {
        return DiscussionReplyModel.findOne({ _id: reply_id, isDeleted: false }).populate(
            'creator_id',
            'username',
        );
    }

    /**
     * Updates an existing reply
     * 
     * Updates reply content or other properties.
     * 
     * @param {string} reply_id - ID of the reply to update
     * @param {UpdateReplyInput} updateData - New reply data
     * @returns {Promise<DiscussionReplyInterface | null>} The updated reply
     */
    static async updateReply(
        reply_id: string,
        updateData: UpdateReplyInput,
    ): Promise<DiscussionReplyInterface | null> {
        return DiscussionReplyModel.findByIdAndUpdate(reply_id, updateData, { new: true });
    }

    /**
     * Soft deletes all replies associated with a post
     * 
     * Recursively marks all replies and their children as deleted
     * when a post is deleted, maintaining data integrity.
     * 
     * @param {string} postId - ID of the post whose replies should be deleted
     * @returns {Promise<void>}
     */
    // Soft delete tất cả các reply liên quan đến post_id
    static async softDeleteRepliesByPost(postId: string): Promise<void> {
        const replies = await DiscussionReplyModel.find({ post_id: postId, isDeleted: false });

        for (const reply of replies) {
            await this.softDeleteRepliesByParent(String(reply._id)); // Ép kiểu _id thành string
        }

        await DiscussionReplyModel.updateMany({ post_id: postId }, { isDeleted: true });
    }

    /**
     * Soft deletes all replies that are children of a specific parent reply
     * 
     * Recursively marks all child replies as deleted when a parent reply
     * is deleted, maintaining the integrity of the reply hierarchy.
     * 
     * @param {string} parentReplyId - ID of the parent reply
     * @returns {Promise<void>}
     */
    // Soft delete tất cả các reply liên quan đến parent_reply_id
    static async softDeleteRepliesByParent(parentReplyId: string): Promise<void> {
        const replies = await DiscussionReplyModel.find({
            parent_reply_id: parentReplyId,
            isDeleted: false,
        });

        for (const reply of replies) {
            await this.softDeleteRepliesByParent(String(reply._id)); // Ép kiểu _id thành string
        }

        await DiscussionReplyModel.updateMany(
            { parent_reply_id: parentReplyId },
            { isDeleted: true },
        );
    }

    /**
     * Soft deletes a specific reply
     * 
     * Marks a single reply as deleted without physically removing it from the database.
     * Does not automatically delete child replies.
     * 
     * @param {string} replyId - ID of the reply to delete
     * @returns {Promise<DiscussionReplyInterface | null>} The updated reply with isDeleted=true
     * @throws {HttpError} If the reply doesn't exist
     */
    // Soft delete một reply cụ thể
    static async deleteReply(replyId: string): Promise<DiscussionReplyInterface | null> {
        const reply = await DiscussionReplyModel.findById(replyId);
        if (!reply) {
            throw new HttpError('Reply not found', 404, 'REPLY_NOT_FOUND');
        }
        return DiscussionReplyModel.findByIdAndUpdate(replyId, { isDeleted: true }, { new: true });
    }
}
