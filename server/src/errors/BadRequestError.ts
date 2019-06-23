import { SlushyError } from './SlushyError'

export class BadRequestError extends SlushyError {
    public readonly status = 400
    public readonly payload: undefined = undefined

    public constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
}
