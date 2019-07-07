import { OpenAPIV3 } from 'openapi-types'

export function isReferenceObject(maybe: unknown): maybe is OpenAPIV3.ReferenceObject {
    return typeof maybe === 'object' && maybe != null && !!(maybe as OpenAPIV3.ReferenceObject).$ref
}

export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export function camelCaseify(s: string): string {
    return s.replace(/[\-\._]{1,}([a-zA-Z])?/g, (...values) => {
        return (values[1] || '').toUpperCase()
    })
}
