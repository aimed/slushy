import { LoggerFactory } from './LoggerFactory'
import { SlushyRequest } from './ServerImpl'
import { SlushyInfo } from './SlushyInfo'
import { SlushyResourceConfiguration } from './SlushyResourceConfiguration'

/**
 * External configuration objects for Slushy.
 */
export interface SlushyConfig<TContext> {
    resourceConfiguration: SlushyResourceConfiguration<TContext>
    contextFactory: (info: SlushyInfo) => Promise<TContext>
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
