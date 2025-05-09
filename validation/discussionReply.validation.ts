import Joi from 'joi';

/**
 * Validation Schema for Reply Creation
 * 
 * Defines validation rules for creating new replies in the system.
 * Supports both top-level replies to posts and nested replies to other replies.
 * Ensures that replies have required content and proper parent relationships.
 */
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

/**
 * Validation Schema for Reply Updates
 * 
 * Defines validation rules for updating existing replies.
 * Ensures that replies maintain required content and proper image references.
 * Supports modifying content and managing attached images.
 */
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