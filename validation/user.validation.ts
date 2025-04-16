import Joi from 'joi';

export const updateUserSchema = Joi.object({
    name: Joi.string().optional().messages({
        'string.base': 'Name must be a string',
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'Invalid email format',
    }),
    // Thêm các trường khác nếu cần, ví dụ: phone, address
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});