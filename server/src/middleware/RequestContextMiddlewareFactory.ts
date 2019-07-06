import { SlushyProps, SlushyRequest, SlushyResponse } from '..'
import { RequestContextMiddleware as RequestContextMiddlewareImpl } from '../requestContext/RequestContext'
import { MiddlewareFactory } from './MiddlewareFactory'

export class RequestContextMiddlewareFactory implements MiddlewareFactory {
    public create(
        _props: SlushyProps<any>,
    ): Array<(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any) => any> {
        return [RequestContextMiddlewareImpl]
    }
}
