import { OpenAPIV3 } from 'openapi-types'
import { TSFile } from '../../typescript/TSFile'
import { capitalize, isReferenceObject } from '../../typescript/utils'

export class BodyTypeFactory {
    public declareBodyType(operationObject: OpenAPIV3.OperationObject, tsFile: TSFile): string {
        const { operationId, requestBody } = operationObject

        let requestBodySchema:
            | OpenAPIV3.SchemaObject & Required<Pick<OpenAPIV3.NonArraySchemaObject, 'oneOf'>>
            | undefined

        if (requestBody) {
            if (isReferenceObject(requestBody)) {
                throw new Error('RequestBody $ref definitions are not supported, maybe you forgot to bundle.')
            }

            requestBodySchema = {
                type: 'object',
                oneOf: [],
            }

            for (const requestBodyMimeType of Object.keys(requestBody.content)) {
                const mediaObject = requestBody.content[requestBodyMimeType]
                if (!mediaObject.schema) {
                    // TODO: Maybe it is not?
                    throw new Error(`Schema is required for content type ${requestBodyMimeType}`)
                }
                requestBodySchema.oneOf.push(mediaObject.schema)
            }

            if (!requestBody.required) {
                // Force a union with undefined
                requestBodySchema.oneOf.push(undefined as any)
            }
        }
        const bodyTypeName = capitalize(`${operationId}Body`)
        const bodyTypeString = tsFile.getTSType(requestBodySchema)
        const bodyTypeDeclaration = `export type ${bodyTypeName} = ${bodyTypeString}`
        tsFile.addSourceText(bodyTypeDeclaration)
        return bodyTypeName
    }
}
