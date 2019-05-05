import { SlushyRequest, SlushyResponse, SlushyContext } from '.'

import { OpenAPIV3 } from 'openapi-types'
import { SlushyProps } from './SlushyProps'
import { OpenApiBridge } from './ServerImpl'
import { Logger } from './LoggerFactory';

export class ContextFactory<TContext = {}> {
    public constructor(private readonly openApiBridge = new OpenApiBridge()) { }

    public async buildContext(
        req: SlushyRequest,
        res: SlushyResponse,
        requestId: string,
        logger: Logger,
        props: SlushyProps
    ): Promise<SlushyContext<TContext>> {
        // FIXME: Add TContext
        const context: SlushyContext<TContext> = {
            req,
            res,
            requestId,
            logger,
            props,
            pathItemObject: this.getPathItemObject(req, props.openApi),
            operationObject: this.getOperationObject(req, props.openApi),
        }

        return context
    }

    protected getPathItemObject(req: SlushyRequest, openApi: OpenAPIV3.Document): OpenAPIV3.PathItemObject {
        const {
            route: { path },
        } = req
        const swaggerPath = this.openApiBridge.makeOASPath(path)
        const pathItemObject = openApi.paths[swaggerPath]

        return pathItemObject
    }

    protected getOperationObject(req: SlushyRequest, openApi: OpenAPIV3.Document): OpenAPIV3.OperationObject {
        const { method } = req
        const pathItemObject = this.getPathItemObject(req, openApi)
        // Note: some server implementation use upper cased http verbs, which is why we need to use toLowerCase here
        const pathItemObjectMethod = method.toLowerCase() as keyof Pick<
            OpenAPIV3.PathItemObject,
            'get' | 'put' | 'post' | 'patch' | 'options' | 'delete' | 'head'
        >

        return pathItemObject[pathItemObjectMethod]!
    }
}
