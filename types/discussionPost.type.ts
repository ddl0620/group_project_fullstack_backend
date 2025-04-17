import { DiscussionPostInterface } from "../interfaces/discussionPost.interfaces";

// Định nghĩa kiểu dữ liệu cho dữ liệu tạo bài viết
export type CreatePostInput = {
    content: string;
    images?: string[];
    creator_id: string;
    event_id: string;
};

// Định nghĩa kiểu dữ liệu cho dữ liệu cập nhật bài viết
export type UpdatePostInput = Partial<CreatePostInput>;

// Định nghĩa kiểu dữ liệu cho phản hồi của getPosts
export type PostListResponse = {
    posts: DiscussionPostInterface[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalPosts: number;
    };
};