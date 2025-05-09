import Joi from 'joi';
import { HttpError } from './httpsError.helpers';

/**
 * Type definition for validation inputs
 * @typedef {Object} ValidationInputs
 * @property {Record<string, any>} inputs - Object containing request data to validate (e.g., body, params, query)
 * @property {boolean} abortEarly - Whether to abort validation on first error
 */

type ValidationInputs = {
    inputs: Record<string, any>; // e.g., { body: request.body, params: request.params }
    abortEarly: boolean;
};

/**
 * Validates request data against a Joi schema
 * 
 * This utility function validates input data (like request body, params, query) against
 * a provided Joi schema. If validation fails, it throws an HttpError with consolidated
 * error messages from all validation failures.
 *
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @param {ValidationInputs} inputs - Object containing the data to validate
 * @throws {HttpError} Throws an HttpError with status 400 if validation fails
 * @returns {void} Does not return any value if validation passes
 */
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
