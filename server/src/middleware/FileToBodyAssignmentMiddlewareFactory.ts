import { PathHttpOperation } from '../types/PathHttpOperation'

import { isReferenceObject } from '../helpers/isReferenceObject'
import { SlushyProps } from '../SlushyProps'
import { SlushyRequestHandler } from '../ServerImpl'
import multerFactory from 'multer'
import { MiddlewareFactory } from './MiddlewareFactory'
import { getRequestContentType, getRequestBody } from '../helpers/schema'

export class FileToBodyAssignmentMiddlewareFactory implements MiddlewareFactory {
    create(props: SlushyProps<any>, path: string, operation: PathHttpOperation): SlushyRequestHandler[] {
        const fields: multerFactory.Field[] = []
        const requestBody = getRequestBody(props.openApi, path, operation)
        const requestContentType = getRequestContentType(props.openApi, path, operation)

        if (requestBody && requestContentType === 'multipart/form-data') {
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
        }

        return [
            (req, _res, next) => {
                if (req.body && typeof req.body === 'object') {
                    // To pass validation, all files must be set to a string
                    for (const { name } of fields) {
                        if (Array.isArray(req.files)) {
                            continue
                        }

                        if (!req.files[name]) {
                            continue
                        }

                        const [file] = req.files[name]
                        req.body[name] = file
                    }
                }
                next()
            },
        ]
    }
}
