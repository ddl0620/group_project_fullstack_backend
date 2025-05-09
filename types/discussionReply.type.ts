import { DiscussionReplyInterface } from "../interfaces/discussionReply.interfaces";

/**
 * Create Reply Input Type
 * 
 * Represents the data required to create a new reply/comment in a discussion.
 * This type defines the structure for submitting replies to posts or other replies,
 * supporting a nested comment structure.
 */
// Định nghĩa kiểu dữ liệu cho dữ liệu tạo bình luận
export type CreateReplyInput = {
    content: string;
    images?: string[];
    creator_id: string;
    post_id: string;
    parent_reply_id?: string;
};

/**
 * Update Reply Input Type
 * 
 * Represents the data that can be updated for an existing reply.
 * All fields are optional, allowing partial updates to reply content.
 */
// Định nghĩa kiểu dữ liệu cho dữ liệu cập nhật bình luận
export type UpdateReplyInput = Partial<CreateReplyInput>;

/**
 * Reply List Response Type
 * 
 * Represents the response structure when retrieving a list of discussion replies.
 * Includes both the reply data and pagination information for navigating large result sets.
 */
// Định nghĩa kiểu dữ liệu cho phản hồi của getReplies
export type ReplyListResponse = {
    replies: DiscussionReplyInterface[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalReplies: number;
    };
};