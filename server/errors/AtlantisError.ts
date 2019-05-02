export abstract class AtlantisError extends Error {
    public constructor(message?: string, public readonly status: number = 500) {
        super(message)
        Object.setPrototypeOf(this, AtlantisError.prototype)
    }
}