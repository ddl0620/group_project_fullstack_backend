import {Response, NextFunction } from "express";
import { ImageDicussionModel } from "../models/imageDiscussion.model";
import { HttpError } from "../helpers/httpsError.helpers";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";

/**
 * Image Access Control Middleware
 * 
 * Verifies that the authenticated user has permission to access specific images.
 * This middleware handles two access scenarios:
 * 1. Access to all images related to a reference ID (e.g., a discussion thread)
 * 2. Access to a specific image by its ID
 * 
 * The middleware checks if the user is the creator of the requested image(s).
 * It expects either reference_id or image_id (or both) to be present in request parameters.
 * 
 * @param req - Extended Express request with authentication properties and image parameters
 * @param res - Express response object (unused but required by Express middleware signature)
 * @param next - Express next middleware function
 * @returns void - Calls next middleware or error handler
 * 
 * @throws HttpError(403) - If user is not authorized to access the requested image(s)
 */
export const checkImageAccess = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    try {
        const { reference_id, image_id } = req.params;
        const userId = req.user?.userId;

        if (reference_id) {
            // Kiểm tra quyền truy cập reference_id
            const images = await ImageDicussionModel.find({ reference_id, creator_id: userId });
            if (!images.length) {
                throw new HttpError("You are not authorized to access these images", 403, "UNAUTHORIZED");
            }
        }

        if (image_id) {
            // Kiểm tra quyền truy cập image_id
            const image = await ImageDicussionModel.findOne({ _id: image_id, creator_id: userId });
            if (!image) {
                throw new HttpError("You are not authorized to access this image", 403, "UNAUTHORIZED");
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};