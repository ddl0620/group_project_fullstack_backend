import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that trims whitespace from string values in request objects.
 * 
 * This middleware automatically removes leading and trailing whitespace from all string values
 * in the request body, query parameters, and URL parameters. This helps standardize input data
 * and prevents issues with unintended whitespace affecting application logic or database queries.
 * 
 * @param req - Express request object containing the data to be trimmed
 * @param _res - Express response object (unused)
 * @param next - Express next function for middleware chaining
 */
const trimRequest = (req: Request, _res: Response, next: NextFunction): void => {
    /**
     * Helper function that recursively trims string values in an object.
     * 
     * @param obj - The object containing string values to trim
     */
    const trimStrings = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
            if (typeof obj[key] === 'string') obj[key] = obj[key].trim();
        }
    };

    trimStrings(req.body);
    trimStrings(req.query);
    trimStrings(req.params);
    next();
};

export default trimRequest;
