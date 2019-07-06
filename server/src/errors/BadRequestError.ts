import { RequestValidationError } from '../middleware/RequestValidatorMiddlewareFactory'
import { SlushyError } from './SlushyError'

export class BadRequestError extends SlushyError {
    public readonly status = 400
    public readonly payload: { errors: RequestValidationError['errors'] }

    public constructor(validationError: RequestValidationError) {
        super()
        Object.setPrototypeOf(this, BadRequestError.prototype)
        this.payload = { errors: validationError.errors }
    }
}
