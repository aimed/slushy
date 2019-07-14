import { OpenAPIV3 } from 'openapi-types'
import { SlushyInfo, SlushyRequest, SlushyResponse } from '.'
import { Logger } from './LoggerFactory'
import { OpenApiBridge } from './ServerImpl'
import { PathHttpOperation } from './types/PathHttpOperation'

export class ContextFactory<TContext> {
    public constructor(private readonly openApiBridge = new OpenApiBridge()) {}

    public async create(
        req: SlushyRequest,
        res: SlushyResponse,
        requestId: string,
        logger: Logger,
        openApi: OpenAPIV3.Document,
        contextFactory: (info: SlushyInfo) => Promise<TContext>,
    ) {
        const info = {
            req,
            res,
            requestId,
            logger,
            pathItemObject: this.getPathItemObject(req, openApi),
            operationObject: this.getOperationObject(req, openApi),
        }
        const context = await contextFactory(info)
        return { info, context }
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
        const pathItemObjectMethod = method.toLowerCase() as keyof Pick<OpenAPIV3.PathItemObject, PathHttpOperation>

        return pathItemObject[pathItemObjectMethod]!
    }
}
