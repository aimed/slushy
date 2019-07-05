import { MiddlewareFactory } from './MiddlewareFactory'
import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'
import { SlushyRequestHandler } from '../ServerImpl'
import OpenAPIDefaultSetter from 'openapi-default-setter'
import { isReferenceObject } from '../helpers/isReferenceObject'
import { OpenAPIV3 } from 'openapi-types'
import { getOperationObject } from '../helpers/schema'

export class RequestDefaultValueSetterMiddlewareFactory implements MiddlewareFactory {
    create(props: SlushyProps<any>, path?: string, operation?: PathHttpOperation): Array<SlushyRequestHandler> {
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
            val => !isReferenceObject(val)
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
