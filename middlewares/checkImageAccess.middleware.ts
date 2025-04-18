import {Response, NextFunction } from "express";
import { ImageDicussionModel } from "../models/imageDiscussion.model";
import { HttpError } from "../helpers/httpsError.helpers";
import { AuthenticationRequest } from "../interfaces/authenticationRequest.interface";

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