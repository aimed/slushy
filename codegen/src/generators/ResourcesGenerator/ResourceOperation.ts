import { OpenAPIV3 } from 'openapi-types'

export interface ResourceOperation {
    parameterType: string
    responseType: string
    path: string
    method: string
    pathItemObject: OpenAPIV3.PathItemObject
}
