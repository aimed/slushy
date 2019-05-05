import { OpenAPIV3 } from 'openapi-types'
import { SlushyConfig } from './SlushyConfig'
import { SlushyPlugins } from './SlushyPlugins';

export interface SlushyProps extends SlushyConfig, SlushyPlugins {
    openApi: OpenAPIV3.Document
}
