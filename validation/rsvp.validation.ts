import Joi from 'joi';
import { RSVPStatus } from '../interfaces/Invitation/rsvp.interface';

// export const createRSVPSchema = Joi.object({
//     response: Joi.string()
//         .valid(...Object.values(RSVPStatus))
//         .required()
//         .messages({
//             'string.base': 'Response must be a string',
//             'any.only': `Response must be one of ${Object.values(RSVPStatus).join(', ')}`,
//             'any.required': 'Response is required',
//         }),
// });

export const createRSVPSchema = Joi.object({
    /**
     * RSVP response status
     * 
     * Required string that indicates the user's response to an invitation.
     * Must be one of the predefined status values: 'PENDING', 'ACCEPTED', or 'DENIED'.
     * - PENDING: User has not yet provided a definitive response
     * - ACCEPTED: User has confirmed attendance or participation
     * - DENIED: User has declined the invitation
     * 
     * Used for tracking attendance, managing event capacity, and updating event organizers.
     */
    response: Joi.string().valid('PENDING', 'ACCEPTED', 'DENIED').required(),
});
