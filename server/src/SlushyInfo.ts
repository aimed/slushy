import { OpenAPIV3 } from 'openapi-types'
import { Logger } from './LoggerFactory'
import { SlushyRequest, SlushyResponse } from './ServerImpl'

/**
 * A context object available in request handlers.
 */
export type SlushyInfo = {
    requestId: string
    logger: Logger
    req: SlushyRequest
    res: SlushyResponse
    pathItemObject: OpenAPIV3.PathItemObject
    operationObject: OpenAPIV3.OperationObject
}
