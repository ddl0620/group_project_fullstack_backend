import { Request, Response, NextFunction } from 'express';

const trimRequest = (req: Request, _res: Response, next: NextFunction): void => {
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
