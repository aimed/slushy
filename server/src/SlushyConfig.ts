import { SlushyResourceConfiguration } from './SlushyResourceConfiguration'
import { SlushyContext } from './SlushyContext'
import { SlushyRequest } from './ServerImpl'

export interface SlushyConfig<TContext> {
    resourceConfiguration: SlushyResourceConfiguration<TContext>
    hostname?: string
    contextFactory: (partialContext: SlushyContext<undefined>) => Promise<TContext>
    getRequestId?: (req: SlushyRequest) => string
}
