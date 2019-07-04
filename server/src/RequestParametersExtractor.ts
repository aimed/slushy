import { SlushyContext } from './SlushyContext'
import { OpenAPIV3 } from 'openapi-types'
import { BadRequestError } from './errors/BadRequestError'
import Ajv from 'ajv'
import { isReferenceObject } from './isReferenceObject'

export class RequestParametersExtractor<TContext> {
    private readonly validator = new Ajv({ allErrors: true, unknownFormats: ['byte', 'binary'] })

    /**
     * Extracts all parameters for the current operation from the request.
     */
    public async getParameters<TParams>(context: SlushyContext<TContext>): Promise<TParams> {
        const { operationObject, req } = context

        const params: { [index: string]: any } = {}

        // TODO: This can be moved to the compile step
        // To validate the input parameters we dynamically create the schema
        const paramSchema: OpenAPIV3.SchemaObject &
            Required<Pick<OpenAPIV3.SchemaObject, 'properties'>> & { required: string[] } = {
            type: 'object',
            properties: {},
            required: [],
        }

        for (const parameter of operationObject.parameters || []) {
            if (isReferenceObject(parameter)) {
                throw new Error('Parameters cannot be defined as $ref, you might have forgotten to resolve the schema')
            }

            const parameterInRequestProperty = {
                path: req.params[parameter.name],
                query: req.query[parameter.name],
            }

            const hasRequestMapping = (inValue: string): inValue is keyof typeof parameterInRequestProperty => {
                return Boolean(inValue in parameterInRequestProperty)
            }

            if (!hasRequestMapping(parameter.in)) {
                throw new Error(
                    `Invalid parameter in value '${parameter.in}', only ${Object.keys(parameterInRequestProperty).join(
                        ', '
                    )} are supported`
                )
            }

            let value = parameterInRequestProperty[parameter.in]
            if (parameter.schema) {
                paramSchema.properties[parameter.name] = parameter.schema
                if (parameter.required) {
                    paramSchema.required.push(parameter.name)
                }
                // Some routers will always pass path arguments as strings. To work around validation we need to convert
                // the type manually.
                // TODO: Actually revive all data
                const type = (parameter.schema as OpenAPIV3.NonArraySchemaObject).type
                if (parameter.in === 'path') {
                    if (type === 'integer' || type === 'number') {
                        value = Number(value)
                    }
                }
            }

            params[parameter.name] = value
        }

        const requestBody = operationObject.requestBody
        const contentSchema =
            requestBody &&
            !isReferenceObject(requestBody) &&
            requestBody.content &&
            requestBody.content[req.is('*/*') || '']

        // FIXME: Disable validation for files
        if (requestBody && !isReferenceObject(requestBody) && contentSchema && contentSchema.schema) {
            if (requestBody.required) {
                paramSchema.required.push('requestBody')
            }
            paramSchema.properties.requestBody = contentSchema.schema
            params.requestBody = req.body
        }

        const isValid = await this.validator.validate(paramSchema, params)
        if (!isValid) {
            throw new BadRequestError(this.validator.errorsText())
        }

        return params as TParams
    }
}
