import { RequestContext } from './requestContext/RequestContext'
import { SlushyProps } from './SlushyProps'
import { SlushyRouterImplementation, SlushyRequestHandler, OpenApiBridge } from './ServerImpl'
import { BodyParser } from './middleware/BodyParser'
import { SlushyError } from './errors/SlushyError'
import { SlushyContext } from './SlushyContext'
import { RequestParametersExtractor } from './RequestParametersExtractor'
import { ContextFactory } from './ContextFactory'
import { ApiDoc } from './middleware/ApiDoc'
import * as UUID from 'uuid'
import { RequestCoercer } from './RequestCoercer'
import { RequestDefaultSetter } from './RequestDefaultSetter'
import { Logger } from './LoggerFactory'
import { RequestId } from './RequestId'
import { RequestContextMiddleware } from './middleware/RequestContextMiddleware'
import { FileUploadMiddleware } from './middleware/FileUploadMiddleware'

export type RouteHandler<TParams, TResponse, TContext> = (
    params: TParams,
    context: SlushyContext<TContext>
) => Promise<TResponse>

export class SlushyRouter<TContext> {
    public constructor(
        public readonly props: SlushyProps<TContext>,
        public readonly router: SlushyRouterImplementation,
        private readonly requestParameterExtractor = new RequestParametersExtractor(),
        private readonly contextFactory = new ContextFactory<TContext>(),
        private readonly requestCoercer = new RequestCoercer<TContext>(),
        private readonly requestDefaultSetter = new RequestDefaultSetter<TContext>(),
        private readonly openApiBridge = new OpenApiBridge(),
        private readonly bodyParser = new BodyParser(),
        private readonly apiDoc = new ApiDoc(),
        private readonly requestContextMiddleware = new RequestContextMiddleware()
    ) {
        // TODO: Move this somewhere else.
        router.use(...this.bodyParser.create(this.props))
        router.use('/api-docs', ...this.apiDoc.create(this.props))
        // This needs to run after all body parser middlewares.
        router.use(...this.requestContextMiddleware.create(this.props))
    }

    public get<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.get(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public post<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = new FileUploadMiddleware(this.props).create(path, 'post')
        this.router.post(this.openApiBridge.makeRouterPath(path), ...middlewares, this.slushyHandler(handler))
    }

    public put<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.put(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public delete<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.delete(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
    }

    public options<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        this.router.options(this.openApiBridge.makeRouterPath(path), this.slushyHandler(handler))
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
    protected slushyHandler<TParams, TResponse>(
        handler: RouteHandler<TParams, TResponse, TContext>
    ): SlushyRequestHandler {
        return async (req, res, _next) => {
            const { loggerFactory, openApi, contextFactory } = this.props

            const requestId: string = UUID.v4()
            RequestContext.set(RequestId, requestId)

            const logger = loggerFactory.create(requestId)
            RequestContext.set(Logger, logger)

            logger.log(`${req.method} ${req.path}`)

            try {
                const context = await this.contextFactory.buildContext(
                    req,
                    res,
                    requestId,
                    logger,
                    openApi,
                    contextFactory
                )
                this.requestDefaultSetter.setDefaults(context)
                this.requestCoercer.coerce(context)

                const parameters = await this.requestParameterExtractor.getParameters<TParams>(context)
                // FIXME: Remove cast again for type safety.
                const resourceResponse = ((await handler(parameters, context)) as unknown) as {
                    status: number
                    payload?: any
                }

                if (resourceResponse.payload) {
                    res.send(resourceResponse.payload).status(resourceResponse.status)
                } else {
                    res.sendStatus(resourceResponse.status)
                }
            } catch (error) {
                // TODO: Move some things to slushy request extension that extends the express request, e.g. operationObject, pathObject, requestId, logger, the context itself?
                if (error instanceof SlushyError) {
                    logger.log(error.payload)
                    res.status(error.status).send(error.payload)
                } else {
                    logger.error(error, 'Unexpected error')
                    res.status(500).send()
                }
            }
        }
    }
}
