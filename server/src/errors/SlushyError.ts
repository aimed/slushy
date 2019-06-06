export abstract class SlushyError extends Error {
    public abstract readonly status: number

    public constructor(message: string = 'InternalServerError') {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}
