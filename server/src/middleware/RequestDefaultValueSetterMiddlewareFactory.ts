import OpenAPIDefaultSetter from 'openapi-default-setter'
import { OpenAPIV3 } from 'openapi-types'
import { isReferenceObject } from '../helpers/isReferenceObject'
import { getOperationObject } from '../helpers/schema'
import { SlushyRequestHandler } from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'
import { MiddlewareFactory } from './MiddlewareFactory'

export class RequestDefaultValueSetterMiddlewareFactory implements MiddlewareFactory {
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
        } catch (_error) {
            return []
        }

        // FIXME: Handle reference objects
        const parameters = (operationObject.parameters || []).filter(
            val => !isReferenceObject(val),
        ) as OpenAPIV3.ParameterObject[]
        const defaultSetter = new OpenAPIDefaultSetter({
            parameters,
        })
        return [
            (req, _res, next) => {
                defaultSetter.handle(req)
                next()
            },
        ]
    }
}
