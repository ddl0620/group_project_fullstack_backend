import {Response, NextFunction } from "express";
import { DiscussionPostService } from "../services/discussionPost.service";
import { HttpResponse } from "../helpers/HttpResponse";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";
import {HttpError} from "../helpers/httpsError.helpers";
import mongoose from "mongoose";
import { DiscussionReplyService } from "../services/discussionReply.service";
import {ImageUploadService} from "../services/imageUpload.service";
import {createPostSchema, updatePostSchema} from "../validation/discussionPost.validation";
// import multer from 'multer';
export class DiscussionPostController {
    // Tạo bài viết
    static async createPost(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate dữ liệu (bỏ qua images vì không dùng URL)
            const { error } = createPostSchema.validate(req.body);
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const { content } = req.body;
            const { eventId } = req.params;
            const creator_id = req.user?.userId;
            const files = req.files as Express.Multer.File[] | undefined;

            if (!creator_id) {
                throw new HttpError('Creator ID is required', 400, 'CREATOR_ID_REQUIRED');
            }

            // Tạo bài viết trước
            const post = await DiscussionPostService.createPost({
                content,
                images: [], // Tạm thời để trống, sẽ cập nhật sau khi xử lý ảnh
                creator_id,
                event_id: eventId,
            });

            if(!post) {
                throw new HttpError(`Failed to create post`);
            }

            // Danh sách URL ảnh từ Cloudinary
            let imageUrls: string[] = [];

            // Nếu có file ảnh, upload lên Cloudinary
            if (files && files.length > 0) {
                const uploadInputs = files.map(file => ({
                    file: file.path,
                    folder: `discussionPosts/${post._id}`,
                }));

                imageUrls = await ImageUploadService.uploadImages(uploadInputs);

                // Cập nhật bài viết với danh sách URL ảnh
            }
            const newPost = await DiscussionPostService.updatePost(post._id as string, { images: imageUrls });


            // Lấy lại bài viết đã cập nhật

            HttpResponse.sendYES(res, 201, 'Post created successfully', { post: newPost });
        } catch (err) {
            next(err);
        }
    }

    static async getPosts(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { eventId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const posts = await DiscussionPostService.getPosts(eventId, page, limit);
            HttpResponse.sendYES(res, 200, "Posts fetched successfully", { posts });

        } catch (err) {
            next(err);
        }
    }

    static async getPostById(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;

            // Kiểm tra định dạng postId
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                throw new HttpError("Invalid post ID format", 400, "INVALID_POST_ID");
            }

            const post = await DiscussionPostService.getPostById(postId);

            if (!post) {
                throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
            }

            HttpResponse.sendYES(res, 200, "Post fetched successfully", { post });
        } catch (err) {
            next(err);
        }
    }

    static async updatePost(req: AuthenticationRequest, res: Response, next: NextFunction) {
        try {
            const { error } = updatePostSchema.validate(req.body);
            if (error) {
                throw new HttpError(error.details[0].message, 400, 'INVALID_INPUT');
            }

            const { postId } = req.params;
            const { content, existingImages } = req.body;
            const files = req.files as Express.Multer.File[] | undefined;

            const currentPost = await DiscussionPostService.getPostById(postId);
            if (!currentPost) {
                throw new HttpError('Post not found', 404, 'POST_NOT_FOUND');
            }

            // Parse existingImages
            let retainedImages: string[] = [];
            if (existingImages) {
                try {
                    retainedImages = Array.isArray(existingImages)
                        ? existingImages
                        : typeof existingImages === 'string'
                            ? JSON.parse(existingImages)
                            : [];
                    if (!Array.isArray(retainedImages)) {
                        throw new Error('existingImages must be an array');
                    }
                } catch (err) {
                    throw new HttpError('Invalid existingImages format', 400, 'INVALID_EXISTING_IMAGES');
                }
            }

            // Identify removed images for Cloudinary cleanup
            const removedImages = (currentPost.images || []).filter(url => !retainedImages.includes(url));

            // Handle new file uploads
            let newImageUrls: string[] = [];
            if (files && files.length > 0) {
                const uploadInputs = files.map(file => ({
                    file: file.path,
                    folder: `discussionPosts/${postId}`,
                }));
                newImageUrls = await ImageUploadService.uploadImages(uploadInputs);
            }

            // Combine retained images and new uploads
            const updatedImages = [...retainedImages, ...newImageUrls];

            // Update post
            const post = await DiscussionPostService.updatePost(postId, {
                content,
                images: updatedImages.length > 0 ? updatedImages : [],
            });

            // Delete removed images from Cloudinary
            if (removedImages.length > 0) {
                await ImageUploadService.deleteImages(removedImages, `discussionPosts/${postId}`);
            }

            HttpResponse.sendYES(res, 200, 'Post updated successfully', { post });
        } catch (err) {
            next(err);
        }
    }


    static async deletePost(req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { postId } = req.params;

            // Kiểm tra định dạng postId
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                throw new HttpError("Invalid post ID format", 400, "INVALID_POST_ID");
            }

            // Đánh dấu bài viết là isDeleted: true
            const post = await DiscussionPostService.deletePost(postId);
            if (!post) {
                throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
            }

            // Đánh dấu tất cả các reply liên quan đến post_id là isDeleted: true
            await DiscussionReplyService.softDeleteRepliesByPost(postId);

            // Đánh dấu tất cả các hình ảnh liên quan đến post_id là isDeleted: true
            // await ImageDiscussionService.softDeleteImagesByReference(postId, "post");

            HttpResponse.sendYES(res, 200, "Post and related data soft deleted successfully", { post });
        } catch (err) {
            next(err);
        }
    }
}