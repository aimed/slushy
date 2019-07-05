import { OpenAPIV3 } from 'openapi-types'

import { PathHttpOperation } from '../types/PathHttpOperation'

import { isReferenceObject } from '../helpers/isReferenceObject'
import { SlushyProps } from '../SlushyProps'
import { SlushyRequestHandler } from '../ServerImpl'
import multerFactory from 'multer'
import { MiddlewareFactory } from './MiddlewareFactory'
import { getRequestContentType, getOperationObject, getRequestBody } from '../helpers/schema'

export class FileUploadMiddlewareFactory implements MiddlewareFactory {
    create(props: SlushyProps<any>, path: string, operation: PathHttpOperation): SlushyRequestHandler[] {
        const requestContentType = getRequestContentType(props, path, operation)
        // Adapted from https://github.com/byu-oit/openapi-enforcer-multer/blob/master/index.js
        const operationObject = getOperationObject(props, path, operation) as OpenAPIV3.OperationObject & {
            'x-multer-limits'?: any
        }

        const requestBody = getRequestBody(props, path, operation)
        const middlewares: SlushyRequestHandler[] = []
        const fields: multerFactory.Field[] = []
        if (requestBody && requestContentType === 'multipart/form-data') {
            const multerLimits = operationObject['x-multer-limits']
            const multer = multerFactory({ storage: multerFactory.memoryStorage(), limits: multerLimits })
            const schema = requestBody.content['multipart/form-data'].schema

            if (!schema) {
                throw new Error('A schema is required for the requestBody of multipart/form-data requests')
            }

            if (isReferenceObject(schema)) {
                throw new Error(
                    'A ReferenceObject is not supported for the requestBody of multipart/form-data requests'
                )
            }

            if (!schema.properties) {
                throw new Error('Schema properties are required for the requestBody of multipart/form-data requests')
            }

            // TODO: Validate mime type
            // profileImage:  # Part 3 (an image)
            //   type: string
            //   format: binary
            //   x-allowed-mime-type: image/png

            for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
                if (isReferenceObject(propertySchema)) {
                    throw new Error(
                        'A ReferenceObject is not supported for the requestBody of multipart/form-data requests'
                    )
                }
                if (
                    propertySchema.type === 'string' &&
                    (propertySchema.format === 'binary' || propertySchema.format === 'byte')
                ) {
                    fields.push({ name: propertyName, maxCount: 1 })
                }
            }

            middlewares.push(multer.fields(fields))
        }

        // FIXME: This must run after the validation step.
        // FIXME: Set all file values to an empty string for validation.
        middlewares.push((req, _res, next) => {
            if (req.body && typeof req.body === 'object') {
                for (const { name } of fields) {
                    if (Array.isArray(req.files)) {
                        continue
                    }
                    const [file] = req.files[name]
                    req.body[name] = file
                }
            }
            next()
        })

        return middlewares
    }
}
