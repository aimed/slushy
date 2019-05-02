import { AtlantisRequest, AtlantisResponse, AtlantisContext } from ".";

import { OpenAPIV3 } from "openapi-types";
import { AtlantisProps } from "./AtlantisProps";
import { OpenApiBridge } from "./ServerImpl";

export class ContextFactory<TContext = {}> {
    public constructor(
        private readonly openApiBridge = new OpenApiBridge()
    ) { }

    public async buildContext(req: AtlantisRequest, res: AtlantisResponse, props: AtlantisProps): Promise<AtlantisContext<TContext>> {
        // FIXME: Add TContext
        const context: AtlantisContext<TContext> = {
            req,
            res,
            props: props,
            pathItemObject: this.getPathItemObject(req, props.openApi),
            operationObject: this.getOperationObject(req, props.openApi),
        }

        return context
    }

    protected getPathItemObject(req: AtlantisRequest, openApi: OpenAPIV3.Document): OpenAPIV3.PathItemObject {
        const { route: { path } } = req
        const swaggerPath = this.openApiBridge.makeSwaggerPath(path)
        const pathItemObject = openApi.paths[swaggerPath]

        return pathItemObject
    }

    protected getOperationObject(req: AtlantisRequest, openApi: OpenAPIV3.Document): OpenAPIV3.OperationObject {
        const { method } = req
        const pathItemObject = this.getPathItemObject(req, openApi)
        // Note: some server implementation use upper cased http verbs, which is why we need to use toLowerCase here
        const pathItemObjectMethod = method.toLowerCase() as keyof Pick<OpenAPIV3.PathItemObject, 'get' | 'put' | 'post' | 'patch' | 'options' | 'delete' | 'head'>

        return pathItemObject[pathItemObjectMethod]!
    }
}