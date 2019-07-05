import { Constructor } from '../types/Constructor'
import * as httpContext from 'express-http-context'

export const RequestContextMiddleware = httpContext.middleware

/**
 * WARNING: Experimental!
 * The [RequestContext] uses cls under the hood. That is why it might not work with some libraries (e.g. async).
 * More info:
 * - https://github.com/skonves/express-http-context
 * - https://github.com/Jeff-Lewis/cls-hooked
 */
export const RequestContext = {
    set<T>(type: Constructor<T>, value: T) {
        httpContext.set(type.name, value)
    },
    get<T>(type: Constructor<T>): T {
        const instance = httpContext.get(type.name)
        if (!instance) {
            throw new Error(`${type.name} was not bound to the RequestContext.`)
        }
        return instance
    },
    tryGet<T>(type: Constructor<T>): T | undefined {
        return httpContext.get(type.name)
    },
}
