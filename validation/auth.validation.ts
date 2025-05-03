import Joi from 'joi';

export const signInSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
});

export const signUpSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required',
    }),
    role: Joi.string().required().messages({
        'any.required': 'Role is required',
    }),
    dateOfBirth: Joi.date().required().messages({
        'date.base': 'Date of birth must be a valid date',
        'any.required': 'Date of birth is required',
    }),
});

export const signUpSchemaAdmin = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required',
    }),
    role: Joi.string().required().messages({
        'any.required': 'Role is required',
    }),
    dateOfBirth: Joi.date().required().messages({
        'date.base': 'Date of birth must be a valid date',
        'any.required': 'Date of birth is required',
    }),
    maxEventCreate: Joi.number().integer().min(0).required().messages({
        'number.base': 'Max event create must be a number',
        'number.integer': 'Max event create must be an integer',
        'number.min': 'Max event create must be at least 0',
        'any.required': 'Max event create is required',
    }),
    maxParticipantPerEvent: Joi.number().integer().min(0).required().messages({
        'number.base': 'Max participant per event must be a number',
        'number.integer': 'Max participant per event must be an integer',
        'number.min': 'Max participant per event must be at least 0',
        'any.required': 'Max participant per event is required',
    }),
});
