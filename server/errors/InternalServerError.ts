import { AtlantisError } from "./AtlantisError";

export class InternalServerError extends AtlantisError {
    public constructor(public readonly internalErrorMessage?: string) {
        super('InternalServerError', 500)
        Object.setPrototypeOf(this, InternalServerError.prototype)
    }
}