"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, statusCode = 500, code, response) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        response === null || response === void 0 ? void 0 : response.status(statusCode).json({
            success: false,
            message: message,
            code: code || "UNKNOWN_ERROR",
        });
    }
}
exports.HttpError = HttpError;
