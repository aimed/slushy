import { SlushyError } from './SlushyError'

export class InternalServerError extends SlushyError {
    public readonly status = 500
    public readonly payload: undefined = undefined
    public readonly internalMetaData: any[]

    public constructor(
        public readonly internalErrorMessage: string = 'InternalServerError',
        ...internalMetaData: any[]
    ) {
        super()
        Object.setPrototypeOf(this, InternalServerError.prototype)
        this.internalMetaData = internalMetaData
    }
}
