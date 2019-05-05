import { SlushyProps } from './SlushyProps'
import { OpenAPIV3 } from 'openapi-types'
import { SlushyRequest, SlushyResponse } from './ServerImpl'
import { Logger } from './LoggerFactory'

export type SlushyContext<TContext extends {} = {}> = {
    requestId: string
    logger: Logger
    req: SlushyRequest
    res: SlushyResponse
    props: SlushyProps
    pathItemObject: OpenAPIV3.PathItemObject
    operationObject: OpenAPIV3.OperationObject
    context?: TContext
}
