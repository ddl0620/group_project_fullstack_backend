import Joi from 'joi';

export const updateUserSchema = Joi.object({
    name: Joi.string().optional().messages({
        'string.base': 'Name must be a string',
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'Invalid email format',
    }),
    // Thêm các trường khác nếu cần, ví dụ: phone, address
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'string.empty': 'Old password is required',
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters long',
        'string.empty': 'New password is required',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Confirm password must match new password',
        'string.empty': 'Confirm password is required',
    }),
}).messages({
    'object.base': 'Invalid input data',
});
