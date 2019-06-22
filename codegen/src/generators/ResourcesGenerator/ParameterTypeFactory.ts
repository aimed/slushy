import { OpenAPIV3 } from 'openapi-types'
import { TSFile } from '../../typescript/module/TSFile'
import { capitalize, isReferenceObject } from '../../typescript/module/utils'
/**
 * Creates a resource operation parameter.
 * @example
 * export type GetPetByIdParams = { petId: string }
 */
export class ParameterTypeFactory {
    declareParameterType(operationObject: OpenAPIV3.OperationObject, tsFile: TSFile): string {
        const { parameters = [], operationId, requestBody } = operationObject
        const inputTypeSchema = {
            type: 'object' as 'object',
            properties: {} as {
                [k: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
            },
            additionalProperties: false,
            required: [] as string[],
        }
        for (const parameter of parameters) {
            if (isReferenceObject(parameter)) {
                throw new Error('Parameter $ref definitions are not supported, maybe you forgot to bundle.')
            }
            if (!parameter.schema) {
                throw new Error(`No schema defined for parameter ${parameter.name} of operation ${operationId}.`)
            }
            if (parameter.in === 'body') {
                throw new Error(
                    'Parameters with `in: body` are not allowed, please use `requestBody` instead. For more details see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#requestBodyObject.'
                )
            }
            if (parameter.required) {
                inputTypeSchema.required.push(parameter.name)
            }
            inputTypeSchema.properties[parameter.name] = {
                ...parameter.schema,
            }
        }
        if (requestBody) {
            if (isReferenceObject(requestBody)) {
                throw new Error('RequestBody $ref definitions are not supported, maybe you forgot to bundle.')
            }
            const requestBodySchema: OpenAPIV3.SchemaObject &
                Required<Pick<OpenAPIV3.NonArraySchemaObject, 'oneOf'>> = {
                type: 'object',
                oneOf: [],
            }
            for (const requestBodyMimeType of Object.keys(requestBody.content)) {
                const mediaObject = requestBody.content[requestBodyMimeType]
                if (!mediaObject.schema) {
                    // TODO: Maybe it is not?
                    throw new Error(`Schema is required for MIME type ${requestBodyMimeType}`)
                }
                requestBodySchema.oneOf.push(mediaObject.schema)
            }
            const requestBodyInputKey = 'requestBody'
            inputTypeSchema.properties[requestBodyInputKey] = requestBodySchema
            if (requestBody.required) {
                inputTypeSchema.required.push(requestBodyInputKey)
            }
        }
        const parameterTypeName = capitalize(`${operationId}Params`)
        const parameterTypeString = tsFile.getTSType(inputTypeSchema)
        const parameterTypeDeclaration = `export type ${parameterTypeName} = ${parameterTypeString}`
        tsFile.addSourceText(parameterTypeDeclaration)
        return parameterTypeName
    }
}
