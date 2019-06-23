import { SlushyError } from './SlushyError'

export class InternalServerError extends SlushyError {
    public readonly status = 500
    public readonly payload: undefined = undefined

    public constructor(public readonly internalErrorMessage: string = 'InternalServerError') {
        super()
        Object.setPrototypeOf(this, InternalServerError.prototype)
    }
}
