import { SlushyRouter } from './SlushyRouter'

export interface SlushyResourceConfiguration {
    configure(router: SlushyRouter): Promise<void>
    getOpenApiSchema(): string
}
