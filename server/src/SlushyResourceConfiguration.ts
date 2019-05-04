import { SlushyRouter } from './SlushyRouter'

export interface SlushyResourceConfiguration {
    configure(router: SlushyRouter): Promise<void>
    getOpenApiPath(): string
}
