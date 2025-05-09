import { ImageDiscussionInterface } from "../interfaces/imageDiscussion.interfaces";

/**
 * Create Image Input Type
 * 
 * Represents the data required to create a new image record in the system.
 * This type is used when uploading or associating images with posts or replies.
 */
// Định nghĩa kiểu dữ liệu cho dữ liệu tạo hình ảnh
export type CreateImageInput = {
    url: string;
    type: "post" | "reply";
    reference_id: string;
};

/**
 * Image List Response Type
 * 
 * Represents the response structure when retrieving a list of images.
 * Typically used for fetching images associated with specific content.
 */
// Định nghĩa kiểu dữ liệu cho phản hồi của getImages
export type ImageListResponse = {
    images: ImageDiscussionInterface[];
};