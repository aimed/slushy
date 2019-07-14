import { InternalServerError } from './InternalServerError'

export class ResponseValidationError extends InternalServerError {
    constructor(...internalMetaData: any[]) {
        super('ResponseValidationError', ...internalMetaData)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}
