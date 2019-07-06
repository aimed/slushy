import multerFactory from 'multer'
import { OpenAPIV3 } from 'openapi-types'
import { isReferenceObject } from '../helpers/isReferenceObject'
import { getOperationObject, getRequestBody, getRequestContentType } from '../helpers/schema'
import { SlushyRequestHandler } from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'
import { MiddlewareFactory } from './MiddlewareFactory'

export class FileUploadMiddlewareFactory implements MiddlewareFactory {
    public create(props: SlushyProps<any>, path: string, operation: PathHttpOperation): SlushyRequestHandler[] {
        const requestContentType = getRequestContentType(props.openApi, path, operation)
        // Adapted from https://github.com/byu-oit/openapi-enforcer-multer/blob/master/index.js
        const operationObject = getOperationObject(props.openApi, path, operation) as OpenAPIV3.OperationObject & {
            'x-multer-limits'?: any
        }

        const requestBody = getRequestBody(props.openApi, path, operation)
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
                    'A ReferenceObject is not supported for the requestBody of multipart/form-data requests',
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
                        'A ReferenceObject is not supported for the requestBody of multipart/form-data requests',
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

        middlewares.push((req, _res, next) => {
            if (req.body && typeof req.body === 'object') {
                // To pass validation, all files must be set to a string
                for (const { name } of fields) {
                    if (!Array.isArray(req.files) && req.files[name] != null) {
                        req.body[name] = '$$FILE$$'
                    }
                }
            }
            next()
        })

        return middlewares
    }
}
