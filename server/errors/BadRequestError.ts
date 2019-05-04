import { SlushyError } from "./SlushyError";

export class BadRequestError extends SlushyError {
    public constructor(message: string) {
        super(message, 400)
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
}