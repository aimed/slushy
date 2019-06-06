import { OpenAPIV3 } from 'openapi-types'
import { capitalize } from '../utils'

export interface ResolvedReference {
    path: string
    symbol: string
}

/**
 * @deprecated Replaced by TSModule
 */
export class ModuleResolver {
    resolve(schema: OpenAPIV3.ReferenceObject): ResolvedReference {
        if (!schema.$ref.startsWith('#/components/schemas/')) {
            throw new Error(
                "Currently only local refs to '#/components/schemas/' are allowed, you might have forgotten to use swagger-parser.bundle"
            )
        }

        const symbol = capitalize(schema.$ref.replace('#/components/schemas/', ''))
        const path = './types'

        return {
            path,
            symbol,
        }
    }
}
