import { AtlantisRouter } from "./AtlantisRouter";

export interface AtlantisResourceConfiguration {
    configure(router: AtlantisRouter): Promise<void>
    getOpenApiPath(): string
}