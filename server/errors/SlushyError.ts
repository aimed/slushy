export abstract class SlushyError extends Error {
    public constructor(message?: string, public readonly status: number = 500) {
        super(message = 'InternalServerError')
        Object.setPrototypeOf(this, SlushyError.prototype)
    }
}