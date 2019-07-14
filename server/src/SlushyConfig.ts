import { LoggerFactory } from './LoggerFactory'
import { SlushyRequest } from './ServerImpl'
import { SlushyContext } from './SlushyContext'
import { SlushyResourceConfiguration } from './SlushyResourceConfiguration'

/**
 * External configuration objects for Slushy.
 */
export interface SlushyConfig<TContext> {
    resourceConfiguration: SlushyResourceConfiguration<TContext>
    contextFactory: (partialContext: SlushyContext<undefined>) => Promise<TContext>
    getRequestId?: (req: SlushyRequest) => string
    transformError?: (error: unknown, req: SlushyRequest) => any
    loggerFactory?: LoggerFactory
    basePath?: string
    docs?: {
        /**
         * Host interactive Api documentation on this path.
         */
        path?: string
    }
}
