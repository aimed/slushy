import { SlushyError } from './SlushyError'

export class InternalServerError extends SlushyError {
    public constructor(public readonly internalErrorMessage?: string) {
        super('InternalServerError', 500)
        Object.setPrototypeOf(this, InternalServerError.prototype)
    }
}
