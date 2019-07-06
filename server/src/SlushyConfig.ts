import { SlushyRequest } from './ServerImpl'
import { SlushyContext } from './SlushyContext'
import { SlushyResourceConfiguration } from './SlushyResourceConfiguration'

export interface SlushyConfig<TContext> {
    resourceConfiguration: SlushyResourceConfiguration<TContext>
    hostname?: string
    contextFactory: (partialContext: SlushyContext<undefined>) => Promise<TContext>
    getRequestId?: (req: SlushyRequest) => string
    // TODO: Should the error be passed to the resource handler?
    transformError?: (error: unknown, req: SlushyRequest) => any
}
