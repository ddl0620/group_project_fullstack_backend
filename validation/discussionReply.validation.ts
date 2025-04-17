import Joi from "joi";

// Validation schema cho tạo bình luận
export const createReplySchema = Joi.object({
    content: Joi.string().required().messages({
        "string.base": "Content must be a string",
        "any.required": "Content is required",
    }),
    images: Joi.array().items(Joi.string()).optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
    }),
    creator_id: Joi.string().required().messages({
        "string.base": "Creator ID must be a string",
        "any.required": "Creator ID is required",
    }),
    post_id: Joi.string().required().messages({
        "string.base": "Post ID must be a string",
        "any.required": "Post ID is required",
    }),
    parent_reply_id: Joi.string().optional().messages({
        "string.base": "Parent Reply ID must be a string",
    }),
});

// Validation schema cho cập nhật bình luận
export const updateReplySchema = Joi.object({
    content: Joi.string().optional().messages({
        "string.base": "Content must be a string",
    }),
    images: Joi.array().items(Joi.string()).optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
    }),
}).min(1).messages({
    "object.min": "At least one field must be provided for update",
});