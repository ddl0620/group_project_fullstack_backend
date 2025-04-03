import {Response} from "express";

export class HttpError extends Error {
    statusCode: number
    code?: string
    response?: Response

    constructor(message: string, statusCode: number = 500, code?: string, response?: Response ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;

        response?.status(statusCode).json({
            success: false,
            message: message,
            code: code || "UNKNOWN_ERROR",
        });

    }
}

