import { DiscussionPostInterface } from "../interfaces/discussionPost.interfaces";

/**
 * Create Post Input Type
 * 
 * Represents the data required to create a new discussion post.
 * This type defines the structure for submitting new posts in the event discussion system.
 */
// Định nghĩa kiểu dữ liệu cho dữ liệu tạo bài viết
export type CreatePostInput = {
    content: string;
    images?: string[];
    creator_id: string;
    event_id: string;
};

/**
 * Update Post Input Type
 * 
 * Represents the data that can be updated for an existing post.
 * All fields are optional, allowing partial updates to post content.
 */
// Định nghĩa kiểu dữ liệu cho dữ liệu cập nhật bài viết
export type UpdatePostInput = Partial<CreatePostInput>;

/**
 * Post List Response Type
 * 
 * Represents the response structure when retrieving a list of discussion posts.
 * Includes both the post data and pagination information for navigating large result sets.
 */
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