export abstract class SlushyError extends Error {
    abstract readonly status: number

    public constructor(message: string = 'InternalServerError') {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}
