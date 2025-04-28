import Joi from 'joi';

export const createReplySchema = Joi.object({
    content: Joi.string().trim().min(1).required().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
        "any.required": "Content is required",
    }),
    parent_reply_id: Joi.string().allow('null', null).regex(/^[0-9a-fA-F]{24}$|^null$/).optional().messages({
        "string.pattern.base": "Parent Reply ID must be a valid ObjectId or 'null'",
    }),
});

export const updateReplySchema = Joi.object({
    content: Joi.string().trim().min(1).required().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content cannot be empty",
        "string.min": "Content must be at least 1 character long",
        "any.required": "Content is required",
    }),
    existingImages: Joi.alternatives().try(
      Joi.array().items(Joi.string().uri()),
      Joi.string().custom((value, helpers) => {
          try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed) || !parsed.every(url => typeof url === 'string' && url.match(/^https?:\/\//))) {
                  return helpers.error('any.invalid');
              }
              return parsed;
          } catch {
              return helpers.error('any.invalid');
          }
      })
    ).optional(),
}).min(1).messages({
    "object.min": "At least one field must be provided for update",
});