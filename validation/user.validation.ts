import Joi from 'joi';

/**
 * Validation Schema for User Profile Updates
 * 
 * Defines validation rules for updating user profile information.
 * Allows optional updates to various user fields while ensuring data integrity.
 * Requires at least one field to be provided for the update operation to proceed.
 */
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

    /**
 * Validation Schema for Password Changes
 * 
 * Defines validation rules for user password updates.
 * Ensures security by requiring current password verification.
 * Enforces password strength requirements and confirmation matching.
 * Used during password change operations to validate user input.
 */
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
