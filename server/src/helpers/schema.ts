import { OpenAPIV3 } from 'openapi-types'
import { PathHttpOperation } from '../types/PathHttpOperation'
import { isReferenceObject } from './isReferenceObject'

export function getPathItemObject(document: OpenAPIV3.Document, path: string): OpenAPIV3.PathItemObject {
    const pathItemObject = document.paths[path]
    if (!pathItemObject) {
        throw new Error(`No PathItemObject for path ${path} exists in the OpenApi Schema`)
    }
    return pathItemObject
}

export function getOperationObject(
    document: OpenAPIV3.Document,
    path: string,
    operation: PathHttpOperation,
): OpenAPIV3.OperationObject {
    const pathItemObject = getPathItemObject(document, path)
    const operationObject = pathItemObject[operation]
    if (!operationObject) {
        throw new Error(`No OperationObject for path ${operation} exists on ${path}`)
    }
    return operationObject
}

export function getRequestBody(
    document: OpenAPIV3.Document,
    path: string,
    operation: PathHttpOperation,
): OpenAPIV3.RequestBodyObject | undefined {
    const operationObject = getOperationObject(document, path, operation)
    if (!operationObject.requestBody) {
        return undefined
    }

    if (isReferenceObject(operationObject.requestBody)) {
        throw new Error(
            `A ReferenceObject is not supported for the requestBody of ${operation.toUpperCase()} ${path}, you likely forgot to resolve the OpenApi Schema`,
        )
    }

    return operationObject.requestBody
}

export function getRequestContentType(
    document: OpenAPIV3.Document,
    path: string,
    operation: PathHttpOperation,
): string | undefined {
    const requestBody = getRequestBody(document, path, operation)
    if (!requestBody) {
        return undefined
    }

    const acceptedContentTypes = Object.keys(requestBody.content)
    if (acceptedContentTypes.length !== 1) {
        throw new Error(`Only one content type is supported for the requestBody of ${operation.toUpperCase()} ${path}`)
    }

    return acceptedContentTypes[0]
}
