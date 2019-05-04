import { OpenAPIV3 } from 'openapi-types'
export function isReferenceObject(maybe: unknown): maybe is OpenAPIV3.ReferenceObject {
    return typeof maybe === 'object' && maybe != null && !!(maybe as OpenAPIV3.ReferenceObject).$ref
}
