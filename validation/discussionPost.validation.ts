import Joi from "joi";

// Validation schema cho tạo bài viết
export const createPostSchema = Joi.object({
    content: Joi.string().required().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
        "any.required": "Content is required",
    }),
    images: Joi.array().items(Joi.string()).optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
        "string.uri": "Each image must be a valid URL",             //  CHECK KĨ 
    }),
    creator_id: Joi.string().required().messages({
        "string.base": "Creator ID must be a string",
        "any.required": "Creator ID is required",   
    }),
    event_id: Joi.string().required().messages({
        "string.base": "Event ID must be a string",
        "any.required": "Event ID is required",
    }),
});

// Validation schema cho cập nhật bài viết
export const updatePostSchema = Joi.object({
    content: Joi.string().optional().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
    }),
    images: Joi.array().items(Joi.string()).optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
        "string.uri": "Each image must be a valid URL",     //  CHECK KĨ 
    }),
}).min(1).messages({
    "object.min": "At least one field must be provided for update",
});