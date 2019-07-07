import * as UUID from 'uuid'
import { getOperationObject, getPathItemObject } from '../helpers/schema'
import { DefaultLoggerFactory } from '../LoggerFactory'
import {
    LoggerSymbol,
    OperationObjectSymbol,
    PathItemObjectSymbol,
    RequestIdSymbol,
    SlushyRequestHandler,
} from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'
import { MiddlewareFactory } from './MiddlewareFactory'

export class RequestExtensionMiddlewareFactory implements MiddlewareFactory {
    public create(props: SlushyProps<any>, path?: string, operation?: PathHttpOperation): SlushyRequestHandler[] {
        if (!path) {
            throw new Error('Path required')
        }

        if (!operation) {
            throw new Error('Operation required')
        }

        const pathItemObject = getPathItemObject(props.openApi, path)
        const operationObject = getOperationObject(props.openApi, path, operation)

        return [
            (req, _res, next) => {
                req[PathItemObjectSymbol] = pathItemObject
                req[OperationObjectSymbol] = operationObject

                const requestId = props.getRequestId ? props.getRequestId(req) : UUID.v4()
                req[RequestIdSymbol] = requestId

                const logger = (props.loggerFactory || new DefaultLoggerFactory()).create(requestId)
                req[LoggerSymbol] = logger

                next()
            },
        ]
    }
}
