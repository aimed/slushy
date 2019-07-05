import { MiddlewareFactory } from './MiddlewareFactory'
import { SlushyRequestHandler } from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'
import * as UUID from 'uuid'
import { Logger } from '../LoggerFactory'

export const LoggerSymbol = Symbol('Logger')
export const RequestIdSymbol = Symbol('RequestId')
export const PathItemObjectSymbol = Symbol('PathItemObject')
export const OperationObjectSymbol = Symbol('OperationObject')

declare global {
    namespace Express {
        interface Request {
            [LoggerSymbol]: Logger
            [RequestIdSymbol]: string
        }
    }
}

export class RequestExtensionMiddlewareFactory implements MiddlewareFactory {
    create(props: SlushyProps<any>): SlushyRequestHandler[] {
        return [
            (req, _res, next) => {
                const requestId = props.getRequestId ? props.getRequestId(req) : UUID.v4()
                req[RequestIdSymbol] = requestId
                next()
            },
            (req, _res, next) => {
                const logger = props.loggerFactory.create(req[RequestIdSymbol])
                req[LoggerSymbol] = logger
                next()
            },
        ]
    }
}
