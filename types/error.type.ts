import { HttpError } from '../helpers/httpsError.helpers';

export type ErrorHandler = {
    (err: any): HttpError;
};
