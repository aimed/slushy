import { OpenAPIV3 } from 'openapi-types'
import { TSModule } from '../typescript/TSModule'

export interface Generator {
    dependsOn: Array<new () => Generator>
    generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void>
}
