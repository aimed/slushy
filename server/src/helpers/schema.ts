import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'
import { OpenAPIV3 } from 'openapi-types'
import { isReferenceObject } from './isReferenceObject'

export function getPathItemObject(props: SlushyProps<any>, path: string): OpenAPIV3.PathItemObject {
    const pathItemObject = props.openApi.paths[path]
    if (!pathItemObject) {
        throw new Error(`No PathItemObject for path ${path} exists in the OpenApi Schema`)
    }
    return pathItemObject
}

export function getOperationObject(
    props: SlushyProps<any>,
    path: string,
    operation: PathHttpOperation
): OpenAPIV3.OperationObject {
    const pathItemObject = getPathItemObject(props, path)
    const operationObject = pathItemObject[operation]
    if (!operationObject) {
        throw new Error(`No OperationObject for path ${operation} exists on ${path}`)
    }
    return operationObject
}

export function getRequestBody(
    props: SlushyProps<any>,
    path: string,
    operation: PathHttpOperation
): OpenAPIV3.RequestBodyObject | undefined {
    const operationObject = getOperationObject(props, path, operation)
    if (!operationObject.requestBody) {
        return undefined
    }

    if (isReferenceObject(operationObject.requestBody)) {
        throw new Error(
            `A ReferenceObject is not supported for the requestBody of ${operation.toUpperCase()} ${path}, you likely forgot to resolve the OpenApi Schema`
        )
    }

    return operationObject.requestBody
}

export function getRequestContentType(
    props: SlushyProps<any>,
    path: string,
    operation: PathHttpOperation
): string | undefined {
    const requestBody = getRequestBody(props, path, operation)
    if (!requestBody) {
        return undefined
    }

    const acceptedContentTypes = Object.keys(requestBody.content)
    if (acceptedContentTypes.length !== 1) {
        throw new Error(`Only one content type is supported for the requestBody of ${operation.toUpperCase()} ${path}`)
    }

    return acceptedContentTypes[0]
}
