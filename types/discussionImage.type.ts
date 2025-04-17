import { ImageDiscussionInterface } from "../interfaces/imageDiscussion.interfaces";

// Định nghĩa kiểu dữ liệu cho dữ liệu tạo hình ảnh
export type CreateImageInput = {
    url: string;
    type: "post" | "reply";
    reference_id: string;
};

// Định nghĩa kiểu dữ liệu cho phản hồi của getImages
export type ImageListResponse = {
    images: ImageDiscussionInterface[];
};