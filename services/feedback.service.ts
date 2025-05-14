// feedback.service.ts

import { FeedbackInterfaces } from '../interfaces/feedback/feedback.interfaces';
import { FeedbackModel } from '../models/feedback/feedback.model';
import { HttpError } from '../helpers/httpsError.helpers';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';

export class FeedbackService {
    static async createFeedback(feedbackData: FeedbackInterfaces): Promise<FeedbackInterfaces> {
        try {
            console.log(feedbackData);
            const feedback: FeedbackInterfaces | null = await FeedbackModel.create({
                ...feedbackData,
            });

            console.log(feedback);

            if (!feedback) {
                throw new HttpError(
                    'Failed to create feedback',
                    StatusCode.CREATED,
                    ErrorCode.CAN_NOT_CREATE,
                );
            }

            return feedback;
        } catch (error: any) {
            throw new HttpError(
                error.message || 'Failed to create feedback',
                StatusCode.CREATED,
                ErrorCode.CAN_NOT_CREATE,
            );
        }
    }

    static async getAllFeedback(): Promise<FeedbackInterfaces[]> {
        try {
            return await FeedbackModel.find().sort({ createdAt: -1 });
        } catch (error) {
            throw new HttpError(
                `Failed to create feedback`,
                StatusCode.NOT_FOUND,
                ErrorCode.RESOURCE_NOT_FOUND,
            );
        }
    }
}
