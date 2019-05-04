export abstract class SlushyError extends Error {
    public constructor(message: string = 'InternalServerError', public readonly status: number = 500) {
        super(message)
        Object.setPrototypeOf(this, SlushyError.prototype)
    }
}