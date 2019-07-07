/**
 * A base class for [Error]s that will can be sent to the clients as an [HTTPResponse].
 */
export abstract class SlushyError extends Error {
    /**
     * The [HTTPStatusCode] of the response.
     */
    public abstract readonly status: number
    /**
     * The [payload] of the response.
     * The content-type will be determined by the [Path].
     */
    public abstract readonly payload?: any

    /**
     * @param message An optional internal error message.
     */
    public constructor(message?: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}
