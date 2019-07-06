import { RequestContext } from './requestContext/RequestContext'
import { SlushyProps } from './SlushyProps'
import {
    SlushyRouterImplementation,
    SlushyRequestHandler,
    OpenApiBridge,
    SlushyErrorRequestHandler,
} from './ServerImpl'
import { BodyParserMiddlewareFactory } from './middleware/BodyParserMiddlewareFactory'
import { SlushyError } from './errors/SlushyError'
import { SlushyContext } from './SlushyContext'
import { RequestParametersExtractor } from './RequestParametersExtractor'
import { ContextFactory } from './ContextFactory'
import { ApiDocMiddlewareFactory } from './middleware/ApiDocMiddlewareFactory'
import { Logger } from './LoggerFactory'
import { RequestId } from './RequestId'
import { RequestContextMiddlewareFactory } from './middleware/RequestContextMiddlewareFactory'
import { FileUploadMiddlewareFactory } from './middleware/FileUploadMiddlewareFactory'
import { RequestValidatorMiddlewareFactory } from './middleware/RequestValidatorMiddlewareFactory'
import { FileToBodyAssignmentMiddlewareFactory } from './middleware/FileToBodyAssignmentMiddlewareFactory'
import { RequestDefaultValueSetterMiddlewareFactory } from './middleware/RequestDefaultValueSetterMiddlewareFactory'
import {
    RequestExtensionMiddlewareFactory,
    RequestIdSymbol,
    LoggerSymbol,
} from './middleware/RequestExtensionMiddlewareFactory'
import { RequestCoercionMiddlewareFactory } from './middleware/RequestCoercionMiddlewareFactory'

export type RouteHandler<TParams, TResponse, TContext> = (
    params: TParams,
    context: SlushyContext<TContext>,
) => Promise<TResponse>

export class SlushyRouter<TContext> {
    private readonly requestParameterExtractor = new RequestParametersExtractor()
    private readonly contextFactory = new ContextFactory<TContext>()
    private readonly openApiBridge = new OpenApiBridge()
    private readonly bodyParserMiddlewareFactory = new BodyParserMiddlewareFactory()
    private readonly requestValidatorMiddlewareFactory = new RequestValidatorMiddlewareFactory()
    private readonly apiDocMiddlewareFactory = new ApiDocMiddlewareFactory()
    private readonly requestContextMiddleware = new RequestContextMiddlewareFactory()
    private readonly fileUploadMiddlewareFactory = new FileUploadMiddlewareFactory()
    private readonly fileToBodyAssignmentMiddlewareFactory = new FileToBodyAssignmentMiddlewareFactory()
    private readonly requestExtensionsMiddlewareFactory = new RequestExtensionMiddlewareFactory()
    private readonly requestCoersionMiddlewareFactory = new RequestCoercionMiddlewareFactory()
    private readonly requestDefaultValueSetterMiddlewareFactory = new RequestDefaultValueSetterMiddlewareFactory()

    public constructor(
        public readonly props: SlushyProps<TContext>,
        public readonly router: SlushyRouterImplementation,
    ) {
        // Extend the request with logger and the requestId
        router.use(...this.requestExtensionsMiddlewareFactory.create(this.props))

        router.use(...this.bodyParserMiddlewareFactory.create(this.props))
        router.use('/api-docs', ...this.apiDocMiddlewareFactory.create(this.props))
        // This needs to run after all body parser middlewares.
        router.use(...this.requestContextMiddleware.create(this.props))
    }

    private errorHandler: SlushyErrorRequestHandler = (error, req, res, _next) => {
        const logger = req[LoggerSymbol] || console
        try {
            error = this.props.transformError ? this.props.transformError(error, req) : error
        } catch (error) {
            // Silently catch this
        }

        if (error instanceof SlushyError) {
            logger.log(error.payload)
            res.status(error.status).send(error.payload)
        } else {
            logger.error('Unexpected error', error)
            res.status(500).send()
        }
    }

    public get<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = [
            ...this.requestCoersionMiddlewareFactory.create(this.props, path, 'get'),
            ...this.requestValidatorMiddlewareFactory.create(this.props, path, 'get'),
        ]
        this.router.get(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public post<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = [
            ...this.requestDefaultValueSetterMiddlewareFactory.create(this.props, path, 'get'),
            ...this.requestCoersionMiddlewareFactory.create(this.props, path, 'get'),
            ...this.fileUploadMiddlewareFactory.create(this.props, path, 'post'),
            ...this.requestValidatorMiddlewareFactory.create(this.props, path, 'post'),
            ...this.fileToBodyAssignmentMiddlewareFactory.create(this.props, path, 'post'),
        ]
        this.router.post(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public put<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = [
            ...this.requestDefaultValueSetterMiddlewareFactory.create(this.props, path, 'put'),
            ...this.requestCoersionMiddlewareFactory.create(this.props, path, 'put'),
            ...this.fileUploadMiddlewareFactory.create(this.props, path, 'put'),
            ...this.requestValidatorMiddlewareFactory.create(this.props, path, 'put'),
            ...this.fileToBodyAssignmentMiddlewareFactory.create(this.props, path, 'put'),
        ]
        this.router.put(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public delete<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = [
            ...this.requestDefaultValueSetterMiddlewareFactory.create(this.props, path, 'delete'),
            ...this.requestCoersionMiddlewareFactory.create(this.props, path, 'delete'),
            ...this.requestValidatorMiddlewareFactory.create(this.props, path, 'delete'),
        ]
        this.router.delete(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public options<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = [
            ...this.requestDefaultValueSetterMiddlewareFactory.create(this.props, path, 'options'),
            ...this.requestCoersionMiddlewareFactory.create(this.props, path, 'options'),
            ...this.requestValidatorMiddlewareFactory.create(this.props, path, 'options'),
        ]

        this.router.options(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public patch<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = [
            ...this.requestDefaultValueSetterMiddlewareFactory.create(this.props, path, 'patch'),
            ...this.requestCoersionMiddlewareFactory.create(this.props, path, 'patch'),
            ...this.fileUploadMiddlewareFactory.create(this.props, path, 'patch'),
            ...this.requestValidatorMiddlewareFactory.create(this.props, path, 'patch'),
            ...this.fileToBodyAssignmentMiddlewareFactory.create(this.props, path, 'patch'),
        ]
        this.router.patch(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public head<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = [
            ...this.requestDefaultValueSetterMiddlewareFactory.create(this.props, path, 'head'),
            ...this.requestCoersionMiddlewareFactory.create(this.props, path, 'head'),
            ...this.requestValidatorMiddlewareFactory.create(this.props, path, 'head'),
        ]
        this.router.head(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    /**
     * Creates a resource handler compatible with the underlying framework.
     * TODO: Move this to bridge.
     */
    protected slushyHandler<TParams, TResponse>(
        handler: RouteHandler<TParams, TResponse, TContext>,
    ): SlushyRequestHandler {
        return async (req, res, _next) => {
            const { openApi, contextFactory } = this.props

            const requestId = req[RequestIdSymbol]
            RequestContext.set(RequestId, requestId)

            const logger = req[LoggerSymbol]
            RequestContext.set(Logger, logger)
            logger.log(`${req.method} ${req.path}`)

            try {
                const context = await this.contextFactory.buildContext(
                    req,
                    res,
                    requestId,
                    logger,
                    openApi,
                    contextFactory,
                )

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
