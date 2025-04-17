import { Response } from 'express';

export class HttpResponse extends Response {
    static sendYES(
        response: Response,
        statusCode: number,
        message: string,
        content: any
    ) {
        response.status(statusCode).json({
            success: true,
            message: message,
            content: content,
        });
    }

}
