import { OpenAPIV3 } from 'openapi-types'
import { TSModule } from '../typescript/module/TSModule'

export interface Generator {
    generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void>
}
