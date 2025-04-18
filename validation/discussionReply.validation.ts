import Joi from "joi";

// Validation schema cho tạo bình luận
export const createReplySchema = Joi.object({
    content: Joi.string().trim().min(1).required().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
        "any.required": "Content is required",
    }),
    images: Joi.array().items(Joi.string().uri()).optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
        "string.uri": "Each image must be a valid URL",
    }),
    creator_id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
        "string.base": "Creator ID must be a string",
        "string.pattern.base": "Creator ID must be a valid ObjectId",
        "any.required": "Creator ID is required",
    }),
    post_id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
        "string.pattern.base": "Post ID must be a valid ObjectId",
    }),
    parent_reply_id: Joi.string().allow(null).optional().regex(/^[0-9a-fA-F]{24}$/).messages({
        "string.pattern.base": "Parent Reply ID must be a valid ObjectId or null",
    }),
});

// Validation schema cho cập nhật bình luận
export const updateReplySchema = Joi.object({
    content: Joi.string().trim().min(1).optional().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
    }),
    images: Joi.array().items(Joi.string().uri()).optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
        "string.uri": "Each image must be a valid URL",
    }),
}).min(1).messages({
    "object.min": "At least one field must be provided for update",
});