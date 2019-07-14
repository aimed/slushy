import { isReferenceObject } from './helpers/isReferenceObject'
import { SlushyInfo } from './SlushyInfo'

export class RequestParametersExtractor {
    /**
     * Extracts all parameters for the current operation from the request.
     */
    public async getParameters<TParams, TBody>(context: SlushyInfo) {
        const { operationObject, req } = context

        const params: { [index: string]: any } = {}

        for (const parameter of operationObject.parameters || []) {
            if (isReferenceObject(parameter)) {
                throw new Error('Parameters cannot be defined as $ref, you might have forgotten to resolve the schema')
            }

            const parameterInRequestProperty = {
                path: req.params[parameter.name],
                query: req.query[parameter.name],
                header: req.headers[parameter.name],
            }

            const hasRequestMapping = (inValue: string): inValue is keyof typeof parameterInRequestProperty => {
                return Boolean(inValue in parameterInRequestProperty)
            }

            if (!hasRequestMapping(parameter.in)) {
                throw new Error(
                    `Invalid parameter in value '${parameter.in}', only ${Object.keys(parameterInRequestProperty).join(
                        ', ',
                    )} are supported`,
                )
            }

            params[parameter.name] = parameterInRequestProperty[parameter.in]
        }

        return {
            params: params as TParams,
            body: req.body as TBody,
        }
    }
}
