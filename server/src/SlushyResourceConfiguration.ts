import { SlushyRouter } from './SlushyRouter'

export interface SlushyResourceConfiguration<TContext> {
    configure(router: SlushyRouter<TContext>): Promise<void>
    getOpenApiSchema(): string
}
