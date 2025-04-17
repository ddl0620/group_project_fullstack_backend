import Joi from 'joi';

export const createInvitationSchema = Joi.object({
    content: Joi.string().optional().messages({
        'string.base': 'Content must be a string',
    }),
    eventId: Joi.string().required().messages({
        'string.base': 'Event ID must be a string',
        'any.required': 'Event ID is required',
    }),
    inviteeId: Joi.string().required().messages({
        'string.base': 'Invitee ID must be a string',
        'any.required': 'Invitee ID is required',
    }),
});