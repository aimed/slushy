import { AtlantisError } from "./AtlantisError";

export class BadRequestError extends AtlantisError {
    public constructor(message: string) {
        super(message, 400)
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
}