import { OpenAPIV3 } from 'openapi-types'
import SwaggerParser from 'swagger-parser'
import { TSFile } from '../../typescript/TSFile'
import { capitalize, isReferenceObject } from '../../typescript/utils'

/**
 * Creates a resource operation parameter.
 * @example
 * export type GetPetByIdParams = { petId: string }
 */
export class ParameterTypeFactory {
    public declareParameterType(
        operationObject: OpenAPIV3.OperationObject,
        tsFile: TSFile,
        references: SwaggerParser.$Refs,
    ): string {
        const { parameters = [], operationId } = operationObject
        const inputTypeSchema = {
            type: 'object' as 'object',
            properties: {} as {
                [k: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
            },
            additionalProperties: false,
            required: [] as string[],
        }

        for (let parameter of parameters) {
            if (isReferenceObject(parameter)) {
                parameter = references.get(parameter.$ref)
                if (isReferenceObject(parameter)) {
                    throw new Error('Could not resolve parameter reference.')
                }
            }

            if (!parameter.schema) {
                throw new Error(`No schema defined for parameter ${parameter.name} of operation ${operationId}.`)
            }

            if (parameter.in === 'body') {
                throw new Error(
                    'Parameters with `in: body` are not allowed, please use `requestBody` instead. For more details see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#requestBodyObject.',
                )
            }

            if (parameter.required) {
                inputTypeSchema.required.push(parameter.name)
            }
            inputTypeSchema.properties[parameter.name] = {
                ...parameter.schema,
            }
        }

        const parameterTypeName = capitalize(`${operationId}Params`)
        const parameterTypeString = tsFile.getTSType(inputTypeSchema)
        const parameterTypeDeclaration = `export type ${parameterTypeName} = ${parameterTypeString}`
        tsFile.addSourceText(parameterTypeDeclaration)
        return parameterTypeName
    }
}
