import { MiddlewareFactory } from './MiddlewareFactory'
import { SlushyProps, SlushyRequest, SlushyResponse } from '..'
import { RequestContextMiddleware as RequestContextMiddlewareImpl } from '../requestContext/RequestContext'

export class RequestContextMiddlewareFactory implements MiddlewareFactory {
    create(
        _props: SlushyProps<any>
    ): Array<(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any) => any> {
        return [RequestContextMiddlewareImpl]
    }
}
