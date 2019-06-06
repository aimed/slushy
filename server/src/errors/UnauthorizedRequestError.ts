import { SlushyError } from "./SlushyError";

export class UnauthorizedRequestError extends SlushyError {
    public readonly status = 401

    public constructor(message: string = 'InternalServerError') {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}
