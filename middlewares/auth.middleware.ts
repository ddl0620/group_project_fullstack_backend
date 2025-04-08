import { NextFunction, Response, Request } from "express";
import { HttpError } from "../helpers/httpsError.helpers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface AuthenticationRequest extends Request {
    user?: {
        userId: string;
    };
}

export const authenticationToken = (
    request: AuthenticationRequest,
    response: Response,
    nextFunction: NextFunction
) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log(token);
    if (!token) {
        return nextFunction(
            new HttpError("No token provided", 401, "NO_TOKEN")
        );
    }

    const secret = process.env.JWT_SECRET;
    console.log("JWT SECRET", secret);
    if (!secret) {
        return nextFunction(
            new HttpError(
                "Server configuration error: JWT secret not set",
                500,
                "SERVER_CONFIG_ERROR"
            )
        );
    }

    try {
        const encoded = jwt.verify(token, secret);
        console.log("encoded", encoded);
        if (
            typeof encoded !== "object" ||
            !encoded ||
            !("userId" in encoded) ||
            typeof encoded.userId !== "string"
        ) {
            return nextFunction(
                new HttpError(
                    "Invalid token payload",
                    401,
                    "INVALID_TOKEN_PAYLOAD"
                )
            );
        }

        request.user = {
            userId: encoded.userId,
        };
        nextFunction();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return nextFunction(
                new HttpError("Token has expired", 401, "TOKEN_EXPIRED")
            );
        } else if (err instanceof jwt.JsonWebTokenError) {
            return nextFunction(
                new HttpError("Invalid token", 401, "INVALID_TOKEN")
            );
        }
        return nextFunction(
            new HttpError("Authentication error", 500, "AUTH_ERROR")
        );
    }
};

export const checkValidId = (id: string, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid ID format" });
    }
    next();
};

export const ensureAuthenticated = (
    req: AuthenticationRequest,
    next: NextFunction
) => {
    if (!req.user?.userId)
        throw new HttpError("Authentication required", 401, "AUTH_REQUIRED");
    return req.user.userId;
};
