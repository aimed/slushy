import { SlushyError } from './SlushyError'

export class InternalServerError extends SlushyError {
    public readonly status = 500

    public constructor(public readonly internalErrorMessage?: string) {
        super()
        Object.setPrototypeOf(this, InternalServerError.prototype)
    }
}
