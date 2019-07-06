import OpenApiRequestCoercer from 'openapi-request-coercer'
import { OpenAPIV3 } from 'openapi-types'
import { getOperationObject } from '../helpers/schema'
import { SlushyRequestHandler } from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'
import { MiddlewareFactory } from './MiddlewareFactory'

export class RequestCoercionMiddlewareFactory implements MiddlewareFactory {
    public create(props: SlushyProps<any>, path?: string, operation?: PathHttpOperation): Array<SlushyRequestHandler> {
        if (!path) {
            throw new Error('RequestCoercionMiddlewareFactory requires path')
        }

        if (!operation) {
            throw new Error('RequestCoercionMiddlewareFactory requires operation')
        }

        let operationObject: OpenAPIV3.OperationObject
        try {
            operationObject = getOperationObject(props.openApi, path, operation)
        } catch (error) {
            return []
        }

        const coercer = new OpenApiRequestCoercer({
            enableObjectCoercion: true,
            parameters: operationObject.parameters || [],
        })

        return [
            (req, _res, next) => {
                coercer.coerce(req)
                next()
            },
        ]
    }
}
