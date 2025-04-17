import Joi from 'joi';
import {RSVPStatus} from "../interfaces/Invitation/rsvp.interface";

export const createRSVPSchema = Joi.object({
    response: Joi.string()
        .valid(...Object.values(RSVPStatus))
        .required()
        .messages({
            'string.base': 'Response must be a string',
            'any.only': `Response must be one of ${Object.values(RSVPStatus).join(', ')}`,
            'any.required': 'Response is required',
        }),
});