import { OpenAPIV3 } from 'openapi-types'

export interface ResourceOperation {
    /**
     * @example getPetById
     */
    name: string
    /**
     * @example GetPetByIdParams
     */
    parameterType: string
    /**
     * @example GetPetByIdBody
     */
    bodyType: string
    /**
     * @example GetPetByIdResponse
     */
    returnType: string
    path: string
    method: string
    pathItemObject: OpenAPIV3.PathItemObject
    operationObject: OpenAPIV3.OperationObject
}
