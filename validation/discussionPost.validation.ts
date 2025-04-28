import Joi from "joi";

// Validation schema cho tạo bài viết
export const createPostSchema = Joi.object({
    content: Joi.string().required().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
        "any.required": "Content is required",
    }),
    images: Joi.optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
        "string.uri": "Each image must be a valid URL",             //  CHECK KĨ
    })
});

// Validation schema cho cập nhật bài viết
export const updatePostSchema = Joi.object({
    content: Joi.string().optional().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
    }),
    images: Joi.optional().messages({
        "array.base": "Images must be an array of strings",
        "string.base": "Each image must be a string",
        "string.uri": "Each image must be a valid URL",     //  CHECK KĨ 
    }),
    existingImages: Joi.optional().messages({
        "array.base": "Existing images must be an array of strings",
        "string.base": "Each existing image must be a string",
        "string.uri": "Each existing image must be a valid URL",     //  CHECK KĨ
    })
}).min(1).messages({
    "object.min": "At least one field must be provided for update",
});