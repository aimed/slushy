import Ajv from 'ajv'
import { OpenAPIV3 } from 'openapi-types'
import { ResponseValidationError } from './errors'
import { isReferenceObject } from './helpers/isReferenceObject'
import { SlushyProps } from './SlushyProps'

export class ResponseValidator {
    private readonly validator: Ajv.Ajv

    public constructor(_props: SlushyProps<any>) {
        this.validator = new Ajv({
            allErrors: true,
            useDefaults: true,
            unknownFormats: 'ignore',
            logger: false,
        })
    }

    public validateResponse(
        status: number,
        payload: any,
        contentType: string,
        operationObject: OpenAPIV3.OperationObject,
    ) {
        // FIXME: Validate more content types
        if (contentType !== 'application/json') {
            return
        }

        if (!operationObject.responses) {
            // No responses expected
            return
        }

        // FIXME: Handle status code range
        const response = operationObject.responses[status.toString()] || operationObject.responses.default
        if (!response) {
            // Status code not expected
            return
        }

        if (isReferenceObject(response)) {
            // Should be resolved
            return
        }

        if (!response.content) {
            if (payload != null) {
                throw new ResponseValidationError('Invalid response content, no content expected')
            }
            // No content expected
            return
        }

        if (!response.content[contentType]) {
            throw new ResponseValidationError('Invalid content type')
        }

        const schema = response.content[contentType].schema
        if (!schema) {
            return
        }

        const isValid = this.validator.validate(schema, payload)
        if (!isValid && this.validator.errors) {
            throw new ResponseValidationError('Invalid response content, validation failed', this.validator.errors)
        }
    }
}
