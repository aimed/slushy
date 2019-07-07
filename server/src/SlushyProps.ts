import { OpenAPIV3 } from 'openapi-types'
import { SlushyConfig } from './SlushyConfig'

/**
 * Properties that are required to configure and use Slushy.
 */
export interface SlushyProps<TContext> extends SlushyConfig<TContext> {
    openApi: OpenAPIV3.Document
}
