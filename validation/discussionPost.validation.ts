import Joi from "joi";

/**
 * Validation Schema for Post Creation
 * 
 * Defines validation rules for creating new posts in the system.
 * Ensures that posts have required content and optional image attachments.
 * Used in post creation endpoints to validate user-submitted content.
 */
// Validation schema cho tạo bài viết
export const createPostSchema = Joi.object({
    /**
     * Post content
     * 
     * Required text content of the post.
     * Must be a non-empty string.
     * Forms the main textual body of the post.
     */
    content: Joi.string().required().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
        "any.required": "Content is required",
    }),
    /**
     * Post images
     * 
     * Optional array of image URLs or image data.
     * Used for attaching visual content to posts.
     * 
     * NOTE: The validation for this field appears incomplete - it's marked as
     * optional but doesn't specify the array structure or URL validation.
     * Consider using Joi.array().items(Joi.string().uri()) for proper validation.
     */
    images: Joi.optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
        "string.uri": "Each image must be a valid URL",             //  CHECK KĨ
    })
});

/**
 * Validation Schema for Post Updates
 * 
 * Defines validation rules for updating existing posts.
 * Ensures that at least one field is provided for update.
 * Supports modifying content and managing attached images.
 */
// Validation schema cho cập nhật bài viết
export const updatePostSchema = Joi.object({
    /**
     * Updated post content
     * 
     * Optional text content update.
     * Must be a non-empty string if provided.
     * Used to modify the main textual body of the post.
     */
    content: Joi.string().optional().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
    }),
    /**
     * New images to add
     * 
     * Optional array of new image URLs or image data to attach to the post.
     * Used for adding new visual content to existing posts.
     * 
     * NOTE: The validation for this field appears incomplete - similar to
     * the create schema, it doesn't specify the array structure properly.
     */
    images: Joi.optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
        "string.uri": "Each image must be a valid URL",     //  CHECK KĨ 
    }),
    /**
     * Existing images to retain
     * 
     * Optional array of image URLs or IDs that should be kept from the original post.
     * Used for managing which images should remain when updating a post.
     * Enables selective removal of images during post updates.
     * 
     * NOTE: The validation for this field has similar issues to the other image fields.
     */
    existingImages: Joi.optional().messages({
        "array.base": "Existing images must be an array of strings",
        "string.base": "Each existing image must be a string",
        "string.uri": "Each existing image must be a valid URL",     //  CHECK KĨ
    })
}).min(1).messages({
    "object.min": "At least one field must be provided for update",
});