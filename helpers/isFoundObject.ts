import { HttpError } from './httpsError.helpers';
import { StatusCode } from '../enums/statusCode.enums';
import { ErrorCode } from '../enums/errorCode.enums';

export const isFoundObject = (object: any, message: string = 'Entity not found') => {
    if (!object) {
        throw new HttpError(message, StatusCode.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND);
    }
};
