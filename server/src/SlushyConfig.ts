import { SlushyResourceConfiguration } from './SlushyResourceConfiguration'
import { SlushyContext } from './SlushyContext'

export interface SlushyConfig<TContext> {
    resourceConfiguration: SlushyResourceConfiguration<TContext>
    hostname?: string
    contextFactory: (partialContext: SlushyContext<undefined>) => Promise<TContext>
}
