import { DiscussionReplyInterface } from "../interfaces/discussionReply.interfaces";

// Định nghĩa kiểu dữ liệu cho dữ liệu tạo bình luận
export type CreateReplyInput = {
    content: string;
    images?: string[];
    creator_id: string;
    post_id: string;
    parent_reply_id?: string;
};

// Định nghĩa kiểu dữ liệu cho dữ liệu cập nhật bình luận
export type UpdateReplyInput = Partial<CreateReplyInput>;

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