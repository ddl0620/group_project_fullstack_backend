import Joi from 'joi';
import { HttpError } from './httpsError.helpers';

type ValidationInputs = {
    inputs: Record<string, any>; // e.g., { body: request.body, params: request.params }
    abortEarly: boolean;
};
export const validateInput = (schema: Joi.ObjectSchema, inputs: ValidationInputs) => {
    // Merge all inputs into a single object
    const mergedData = Object.entries(inputs).reduce((acc, [key, value]) => {
        return { ...acc, [key]: value };
    }, {});

    // Validate the merged data
    const { error } = schema.validate(mergedData, { abortEarly: false });

    if (error?.details) {
        //Append error messages
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        throw new HttpError(errorMessage, 400, 'VALIDATION_ERROR');
    }
};
