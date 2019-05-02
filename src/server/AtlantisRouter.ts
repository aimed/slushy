import { AtlantisProps } from "./Atlantis";
import { OpenAPIV3 } from 'openapi-types';
import { isReferenceObject } from '../codegen/ResourceFactory';
import Ajv from 'ajv'
import { JSONSchema4 } from 'json-schema';
import { AtlantisRequest, AtlantisResponse, AtlantisRouterImplementationFactory, AtlantisRouterImplementation, AtlantisRequestHandler } from "./ServerImpl";
import { BodyParser } from "./middleware/BodyParser";

export type AtlantisContext<TContext = {}> = {
    req: AtlantisRequest
    res: AtlantisResponse
    props: AtlantisProps
    pathItemObject: OpenAPIV3.PathItemObject
    operationObject: OpenAPIV3.OperationObject
} // TODO: & TContext

export type RouteHandler<TParams, TResponse, TContext> = (params: TParams, context: AtlantisContext<TContext>) => Promise<TResponse>

export class AtlantisRouter<TContext = {}> {
    private readonly validator = new Ajv()
    public constructor(
        public readonly props: AtlantisProps,
        private readonly router: AtlantisRouterImplementation = AtlantisRouterImplementationFactory.create(),
    ) {
        router.use(new BodyParser().create())
    }

    public get<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.get(this.makeRouterPath(path), this.makeHandlerExecutable(handler))
    }

    public post<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.post(this.makeRouterPath(path), this.makeHandlerExecutable(handler))
    }

    public delete<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.delete(this.makeRouterPath(path), this.makeHandlerExecutable(handler))
    }

    public options<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.options(this.makeRouterPath(path), this.makeHandlerExecutable(handler))
    }

    public put<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.put(this.makeRouterPath(path), this.makeHandlerExecutable(handler))
    }

    public patch<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.patch(this.makeRouterPath(path), this.makeHandlerExecutable(handler))
    }

    public head<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.head(this.makeRouterPath(path), this.makeHandlerExecutable(handler))
    }

    protected makeRouterPath(path: string): string {
        return path.replace(/\{([a-zA-Z0-9]*)\}/g, (_match, matches) => `:${matches}`)
    }

    protected makeSwaggerPath(path: string): string {
        return path.replace(/:([a-zA-Z0-9]*)/g, (_match, matches) => `{${matches}}`)
    }

    protected makeHandlerExecutable<TParams, TResponse>(handler: RouteHandler<TParams, TResponse, TContext>): AtlantisRequestHandler {
        return async (req, res, next) => {
            try {
                const context = await this.buildContext(req, res)
                const parameters = await this.getParameters<TParams>(context)
                const resourceResponse = await handler(parameters, context)
                res.send(resourceResponse)
                next()
            } catch (error) {
                next(error)
            }
        }
    }

    protected async buildContext(req: AtlantisRequest, res: AtlantisResponse): Promise<AtlantisContext<TContext>> {
        // FIXME: Add TContext
        const context: AtlantisContext<TContext> = {
            req,
            res,
            props: this.props,
            pathItemObject: this.getPathItemObject(req, this.props.openApi),
            operationObject: this.getOperationObject(req, this.props.openApi),
        }

        return context
    }

    protected getPathItemObject(req: AtlantisRequest, openApi: OpenAPIV3.Document): OpenAPIV3.PathItemObject {
        const { route: { path } } = req
        const swaggerPath = this.makeSwaggerPath(path)
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

    /**
     * Extracts all parameters for the current operation from the request.
     */
    protected async getParameters<TParams>(context: AtlantisContext<TContext>): Promise<TParams> {
        const operation = context.operationObject

        const params: { [index: string]: any } = {}

        // TODO: This can be moved to the compile step
        // To validate the input parameters we dynamically create the schema
        const paramSchema: JSONSchema4 & Required<Pick<JSONSchema4, 'properties'>> = {
            type: 'object',
            properties: {},
        }

        for (const parameter of operation.parameters || []) {
            if (isReferenceObject(parameter)) {
                // TODO: Not supported right now
                continue
            }

            const parameterInRequestProperty = {
                path: context.req.params,
                query: context.req.query,
                body: context.req.body,
            }

            let value = parameterInRequestProperty[parameter.in as keyof typeof parameterInRequestProperty][parameter.name]
            if (parameter.schema) {
                paramSchema.properties[parameter.name] = parameter.schema
                // Some routers will always pass path arguments as strings. To work around validation we need to convert
                // the type manually.
                // TODO: Actually revive all data
                const type = (parameter.schema as OpenAPIV3.NonArraySchemaObject).type
                if (parameter.in === 'path') {
                    if (type === 'integer' || type === 'number') {
                        value = Number(value)
                    }
                }
            }

            params[parameter.name] = value
        }


        const isValid = await this.validator.validate(paramSchema, params)
        if (!isValid) {
            // TODO: Throw proper error with status code
            throw new Error(this.validator.errorsText())
        }

        return params as TParams
    }
}