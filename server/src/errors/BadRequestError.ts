import { SlushyError } from './SlushyError'
import { RequestValidationError } from '../middleware/RequestValidatorMiddlewareFactory'

export class BadRequestError extends SlushyError {
    public readonly status = 400
    public readonly payload: { errors: RequestValidationError['errors'] }

    public constructor(validationError: RequestValidationError) {
        super()
        Object.setPrototypeOf(this, BadRequestError.prototype)
        this.payload = { errors: validationError.errors }
    }
}
