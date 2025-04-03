"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware = (err, req, res, next) => {
    let error = Object.assign(Object.assign({}, err), { message: err.message || "Internal Server Error" });
    console.error(err);
    if (err.name === "CastError") {
        error = new Error("Resource not found");
        error.statusCode = 404;
        error.code = "RESOURCE_NOT_FOUND";
    }
    if (err.code === "11000" || err.code === 11000) { // Handle Mongoose duplicate key error
        error = new Error("Duplicate field value entered");
        error.statusCode = 400;
        error.code = "DUPLICATE_KEY";
    }
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors || {}).map((value) => value.message).join(", ");
        error = new Error(message);
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        code: error.code || "UNKNOWN_ERROR"
    });
};
exports.default = errorMiddleware;
