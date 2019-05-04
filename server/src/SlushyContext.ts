import { SlushyProps } from './SlushyProps'
import { OpenAPIV3 } from 'openapi-types'
import { SlushyRequest, SlushyResponse } from './ServerImpl'
export type SlushyContext<TContext extends {} = {}> = {
    req: SlushyRequest
    res: SlushyResponse
    props: SlushyProps
    pathItemObject: OpenAPIV3.PathItemObject
    operationObject: OpenAPIV3.OperationObject
    context?: TContext
}
