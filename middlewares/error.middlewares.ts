import { Request, Response, NextFunction } from "express";

// Define the same custom error type
interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

const errorMiddleware = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error: AppError = { ...err, message: err.message || "Internal Server Error" };

    console.error(err);

    if (err.name === "CastError") {
        error = new Error("Resource not found") as AppError;
        error.statusCode = 404;
        error.code = "RESOURCE_NOT_FOUND";
    }

    if (err.code === "11000" || (err as any).code === 11000) { // Handle Mongoose duplicate key error
        error = new Error("Duplicate field value entered") as AppError;
        error.statusCode = 400;
        error.code = "DUPLICATE_KEY";
    }

    if (err.name === "ValidationError") {
        const message = Object.values((err as any).errors || {}).map((value: any) => value.message).join(", ");
        error = new Error(message) as AppError;
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        code: error.code || "UNKNOWN_ERROR"
    });
};

export default errorMiddleware;