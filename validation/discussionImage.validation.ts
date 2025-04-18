import Joi from "joi";

// Validation schema cho tạo hình ảnh
export const createImageSchema = Joi.object({
    url: Joi.string().uri().required().messages({
        "string.base": "URL must be a string",
        "string.uri": "URL must be a valid URL",
        "any.required": "URL is required",
    }),
    type: Joi.string()
        .valid("post", "reply")
        .required()
        .messages({
            "string.base": "Type must be a string",
            "any.only": "Type must be either 'post' or 'reply'",
            "any.required": "Type is required",
        }),
    reference_id: Joi.string().required().messages({
        "string.base": "Reference ID must be a string",
        "any.required": "Reference ID is required",
    }),
});

export const updateImageSchema = Joi.object({
    reference_id: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/).messages({
        "string.pattern.base": "Reference ID must be a valid ObjectId",
    }),
    isDeleted: Joi.boolean().optional(),
});