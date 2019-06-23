export abstract class SlushyError extends Error {
    public abstract readonly status: number
    public abstract readonly payload?: any

    public constructor(message?: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}
