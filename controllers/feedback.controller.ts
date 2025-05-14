// feedback.controller.ts

import { AuthenticationRequest } from '../interfaces/authenticationRequest.interface';
import { FeedbackInterfaces } from '../interfaces/feedback/feedback.interfaces';
import { FeedbackService } from '../services/feedback.service';
import { HttpResponse } from '../helpers/HttpResponse';
import { StatusCode } from '../enums/statusCode.enums';
import { Request, Response } from 'express';
import { HttpError } from '../helpers/httpsError.helpers';
import { ErrorCode } from '../enums/errorCode.enums';

export class FeedbackController {
    static async createFeedback(req: AuthenticationRequest, res: Response) {
        try {
            const feedbackData: FeedbackInterfaces = req.body;
            const feedback = await FeedbackService.createFeedback(feedbackData);
            HttpResponse.sendYES(
                res,
                StatusCode.CREATED,
                'Feedback created successfully',
                feedback,
            );
        } catch (error: any) {
            throw new HttpError(
                error.message || 'Failed to create feedback',
                StatusCode.CREATED,
                ErrorCode.CAN_NOT_CREATE,
            );
        }
    }

    static async getAllFeedback(req: Request, res: Response) {
        try {
            const feedbacks = await FeedbackService.getAllFeedback();
            HttpResponse.sendYES(res, StatusCode.FOUND, 'Feedbacks fetch successfully', feedbacks);
        } catch (error) {
            throw new HttpError(
                'Failed to fetch feedback',
                StatusCode.INTERNAL_SERVER_ERROR,
                ErrorCode.RESOURCE_NOT_FOUND,
            );
        }
    }
}
