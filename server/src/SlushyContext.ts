import { OpenAPIV3 } from 'openapi-types'
import { SlushyRequest, SlushyResponse } from './ServerImpl'
import { Logger } from './LoggerFactory'

export type SlushyContext<TContext> = {
    requestId: string
    logger: Logger
    req: SlushyRequest
    res: SlushyResponse
    pathItemObject: OpenAPIV3.PathItemObject
    operationObject: OpenAPIV3.OperationObject
    context: TContext
}
