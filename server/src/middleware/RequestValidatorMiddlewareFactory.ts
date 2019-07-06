import Ajv from 'ajv'
import { OpenAPIV3 } from 'openapi-types'
import { isReferenceObject } from '../helpers/isReferenceObject'
import { getOperationObject } from '../helpers/schema'
import { SlushyRequestHandler } from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'
import { MiddlewareFactory } from './MiddlewareFactory'

type ConstructableJsonSchema = OpenAPIV3.SchemaObject &
    Required<Pick<OpenAPIV3.SchemaObject, 'properties'>> & { required: string[] }

export class RequestValidationError extends Error {
    public constructor(public readonly errors: Ajv.ErrorObject[]) {
        super()
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class RequestValidatorMiddlewareFactory implements MiddlewareFactory {
    private readonly validator = new Ajv({
        allErrors: true,
        unknownFormats: 'ignore',
    })

    public create(props: SlushyProps<any>, path?: string, operation?: PathHttpOperation): SlushyRequestHandler[] {
        if (!path) {
            throw new Error('RequestValidatorMiddlewareFactory requires path')
        }

        if (!operation) {
            throw new Error('RequestValidatorMiddlewareFactory requires operation')
        }

        const operationObject = getOperationObject(props.openApi, path, operation)
        const { parameters = [], requestBody } = operationObject

        if (isReferenceObject(requestBody)) {
            throw new Error(`The requestBody in ${operation.toUpperCase()} ${path} cannot be a ReferenceObject`)
        }

        const requestParametersValidationSchema = this.buildRequestParametersValidationSchema(parameters)
        const requestBodyValidationSchemas = this.buildRequestBodyValidationSchemas(requestBody)
        return [
            (req, _res, next) => {
                let validationErrors: (Ajv.ErrorObject | null | undefined)[] = []

                // Validate all parameters
                const parametersAreValid = this.validator.validate(requestParametersValidationSchema, req)
                if (!parametersAreValid) {
                    validationErrors.push(...(this.validator.errors || []))
                }

                // Try to validate the request body
                const requestBodyValidationSchema = requestBodyValidationSchemas[req.is('*/*') || '']
                if (requestBodyValidationSchema) {
                    const requestBodyIsValid = this.validator.validate(requestBodyValidationSchema, req)
                    if (!requestBodyIsValid) {
                        validationErrors.push(...(this.validator.errors || []))
                    }
                }

                const nonNullValidationErrors = validationErrors.filter(Boolean) as Ajv.ErrorObject[]
                if (nonNullValidationErrors.length > 0) {
                    throw new RequestValidationError(nonNullValidationErrors)
                }
                next()
            },
        ]
    }

    private buildRequestBodyValidationSchemas(
        requestBody: OpenAPIV3.RequestBodyObject | undefined,
    ): { [contentType: string]: OpenAPIV3.SchemaObject | undefined } {
        const contentTypeSchemas: { [contentType: string]: OpenAPIV3.SchemaObject } = {}
        if (!requestBody) {
            return contentTypeSchemas
        }

        const createBodyValidationSchema = (body: OpenAPIV3.SchemaObject) =>
            ({
                type: 'object',
                properties: {
                    body,
                },
                required: requestBody.required ? ['body'] : [],
            } as ConstructableJsonSchema)

        for (const [contentType, mediaTypeObject] of Object.entries(requestBody.content)) {
            if (!mediaTypeObject.schema) {
                continue
            }

            if (isReferenceObject(mediaTypeObject.schema)) {
                throw new Error('A ReferenceObject is not supported, you likely forgot to resolve the schema first')
            }

            contentTypeSchemas[contentType] = createBodyValidationSchema(mediaTypeObject.schema)
        }

        return contentTypeSchemas
    }

    private buildRequestParametersValidationSchema(
        parameters: (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[],
    ): OpenAPIV3.SchemaObject {
        const schemas = {
            params: {
                type: 'object',
                properties: {},
                required: [],
            } as ConstructableJsonSchema,
            query: {
                type: 'object',
                properties: {},
                required: [],
                additionalProperties: true,
            } as ConstructableJsonSchema,
            headers: {
                type: 'object',
                properties: {},
                required: [],
                additionalProperties: true,
            } as ConstructableJsonSchema,
        }

        for (const parameter of parameters) {
            if (isReferenceObject(parameter)) {
                throw new Error('Parameters cannot be defined as $ref, you might have forgotten to resolve the schema')
            }

            if (!parameter.schema) {
                continue
            }

            if (isReferenceObject(parameter.schema)) {
                throw new Error(
                    'Parameter schemas cannot be defined as $ref, you might have forgotten to resolve the schema',
                )
            }

            const schemaKeyMap: { [index: string]: keyof typeof schemas | undefined } = {
                path: 'params',
                query: 'query',
            }
            const schemaKey = schemaKeyMap[parameter.in]

            if (!schemaKey) {
                throw new Error(`Parameters of type ${parameter.in} are currently not supported`)
            }

            let parameterSchema = schemas[schemaKey]

            if (parameter.schema) {
                parameterSchema.properties[parameter.name] = parameter.schema
                if (parameter.required) {
                    parameterSchema.required.push(parameter.name)
                }
            }
        }

        // To validate the input parameters we dynamically create the schema
        const validationSchema: OpenAPIV3.SchemaObject = {
            type: 'object',
            properties: {
                ...schemas,
            },
            required: [...Object.keys(schemas)],
        }

        return validationSchema
    }
}
