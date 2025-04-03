import {JWT_EXPIRES_IN, JWT_SECRET} from "../config/env";
import jwt from "jsonwebtoken";

export const generateToken = (userId: string): string => {
    // @ts-ignore
    return jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
}