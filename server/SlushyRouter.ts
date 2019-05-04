import { SlushyProps } from "./SlushyProps";
import { SlushyRouterImplementationFactory, SlushyRouterImplementation, SlushyRequestHandler, OpenApiBridge } from "./ServerImpl";
import { BodyParser } from "./middleware/BodyParser";
import { SlushyError } from "./errors/SlushyError";
import { SlushyContext } from "./SlushyContext";
import { RequestParametersExtractor } from "./RequestParametersExtractor";
import { ContextFactory } from "./ContextFactory";
import { ApiDoc } from "./middleware/ApiDoc";

export type RouteHandler<TParams, TResponse, TContext> = (params: TParams, context: SlushyContext<TContext>) => Promise<TResponse>

export class SlushyRouter<TContext = {}> {
    public constructor(
        public readonly props: SlushyProps,
        public readonly router: SlushyRouterImplementation = SlushyRouterImplementationFactory.create(),
        private readonly requestParameterExtractor = new RequestParametersExtractor(),
        private readonly contextFactory = new ContextFactory(),
        private readonly openApiBridge = new OpenApiBridge(),
    ) {
        // TODO: Move this somewhere else.
        router.use(...new BodyParser().create(this.props))
        router.use('/api-docs', ...new ApiDoc().create(this.props))
    }

    public get<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.get(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public post<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.post(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public delete<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.delete(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public options<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.options(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public put<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.put(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public patch<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.patch(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public head<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.head(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    /**
     * Creates a resource handler compatible with the underlying framework.
     * TODO: Move this to bridge.
     */
    protected slushyHandler<TParams, TResponse>(handler: RouteHandler<TParams, TResponse, TContext>): SlushyRequestHandler {
        return async (req, res, next) => {
            try {
                const context = await this.contextFactory.buildContext(req, res, this.props)
                const parameters = await this.requestParameterExtractor.getParameters<TParams>(context)
                const resourceResponse = await handler(parameters, context)
                res.send(resourceResponse)
                next()
            } catch (error) {
                if (error instanceof SlushyError) {
                    return res.status(error.status).send({ message: error.message })
                }
                next(error)
            }
        }
    }

}