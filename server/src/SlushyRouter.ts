import { ContextFactory } from './ContextFactory'
import { ResponseValidationError } from './errors'
import { SlushyError } from './errors/SlushyError'
import { isReferenceObject } from './helpers/isReferenceObject'
import { DefaultLoggerFactory, Logger } from './LoggerFactory'
import { ApiDocMiddlewareFactory } from './middleware/ApiDocMiddlewareFactory'
import { BodyParserMiddlewareFactory } from './middleware/BodyParserMiddlewareFactory'
import { FileToBodyAssignmentMiddlewareFactory } from './middleware/FileToBodyAssignmentMiddlewareFactory'
import { FileUploadMiddlewareFactory } from './middleware/FileUploadMiddlewareFactory'
import { MiddlewareFactory } from './middleware/MiddlewareFactory'
import { RequestCoercionMiddlewareFactory } from './middleware/RequestCoercionMiddlewareFactory'
import { RequestContextMiddlewareFactory } from './middleware/RequestContextMiddlewareFactory'
import { RequestDefaultValueSetterMiddlewareFactory } from './middleware/RequestDefaultValueSetterMiddlewareFactory'
import { RequestExtensionMiddlewareFactory } from './middleware/RequestExtensionMiddlewareFactory'
import { RequestValidatorMiddlewareFactory } from './middleware/RequestValidatorMiddlewareFactory'
import { RequestContext } from './requestContext/RequestContext'
import { RequestId } from './RequestId'
import { RequestParametersExtractor } from './RequestParametersExtractor'
import { ResponseValidator } from './ResponseValidator'
import {
    LoggerSymbol,
    OpenApiBridge,
    OperationObjectSymbol,
    RequestIdSymbol,
    SlushyErrorRequestHandler,
    SlushyRequest,
    SlushyRequestHandler,
    SlushyRouterImplementation,
} from './ServerImpl'
import { SlushyContext } from './SlushyContext'
import { SlushyProps } from './SlushyProps'

export type RouteHandler<TParams, TResponse, TContext> = (
    params: TParams,
    context: SlushyContext<TContext>,
) => Promise<TResponse>

interface ResponseLike {
    status: number
    payload?: any
}

function isResponseLike(maybe: unknown): maybe is ResponseLike {
    if (maybe == null) {
        return false
    }

    if (typeof maybe !== 'object') {
        return false
    }

    const obj = maybe as ResponseLike
    if (typeof obj.status !== 'number') {
        return false
    }

    return true
}

export class SlushyRouter<TContext> {
    private readonly requestParameterExtractor = new RequestParametersExtractor()
    private readonly contextFactory = new ContextFactory<TContext>()
    private readonly openApiBridge = new OpenApiBridge()
    private readonly apiDocMiddlewareFactory = new ApiDocMiddlewareFactory()
    private readonly responseValidator: ResponseValidator

    public constructor(
        public readonly props: SlushyProps<TContext>,
        public readonly router: SlushyRouterImplementation,
        private readonly middlewareFactories: Array<new () => MiddlewareFactory> = [
            RequestExtensionMiddlewareFactory,
            BodyParserMiddlewareFactory,
            RequestDefaultValueSetterMiddlewareFactory,
            RequestCoercionMiddlewareFactory,
            FileUploadMiddlewareFactory,
            RequestValidatorMiddlewareFactory,
            FileToBodyAssignmentMiddlewareFactory,
            // This needs to run after all other middlewares
            RequestContextMiddlewareFactory,
        ],
    ) {
        this.responseValidator = new ResponseValidator(props)
        if (props.docs && props.docs.path) {
            router.use(props.docs.path, ...this.apiDocMiddlewareFactory.create(this.props))
        }
    }

    private errorHandler: SlushyErrorRequestHandler = (error, req, res, _next) => {
        const logger = req[LoggerSymbol] || new DefaultLoggerFactory().create(req[RequestIdSymbol] || '')
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
        const middlewares = this.middlewareFactories
            .map(Factory => new Factory())
            .map(factory => factory.create(this.props, path, 'get'))
        this.router.get(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public post<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = this.middlewareFactories
            .map(Factory => new Factory())
            .map(factory => factory.create(this.props, path, 'post'))
        this.router.post(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public put<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = this.middlewareFactories
            .map(Factory => new Factory())
            .map(factory => factory.create(this.props, path, 'put'))
        this.router.put(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public delete<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = this.middlewareFactories
            .map(Factory => new Factory())
            .map(factory => factory.create(this.props, path, 'delete'))
        this.router.delete(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public options<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = this.middlewareFactories
            .map(Factory => new Factory())
            .map(factory => factory.create(this.props, path, 'options'))
        this.router.options(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public patch<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = this.middlewareFactories
            .map(Factory => new Factory())
            .map(factory => factory.create(this.props, path, 'patch'))
        this.router.patch(
            this.openApiBridge.makeRouterPath(path),
            ...middlewares,
            this.slushyHandler(handler),
            this.errorHandler,
        )
    }

    public head<TParams, TResponse>(path: string, handler: RouteHandler<TParams, TResponse, TContext>) {
        const middlewares = this.middlewareFactories
            .map(Factory => new Factory())
            .map(factory => factory.create(this.props, path, 'head'))
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
                const resourceResponse = await handler(parameters, context)
                if (!isResponseLike(resourceResponse)) {
                    throw new ResponseValidationError('Unexpected response', resourceResponse)
                }

                const contentType = this.getContentType(req, resourceResponse)
                if (contentType) {
                    this.responseValidator.validateResponse(
                        resourceResponse.status,
                        resourceResponse.payload,
                        contentType,
                        req[OperationObjectSymbol],
                    )
                }

                if (resourceResponse.payload) {
                    if (!res.headersSent && contentType) {
                        res.type(contentType)
                    }
                    res.status(resourceResponse.status).send(resourceResponse.payload)
                } else {
                    res.sendStatus(resourceResponse.status)
                }
            } catch (error) {
                if (error instanceof SlushyError) {
                    logger.log(error.payload, error.metaData)
                    res.status(error.status).send(error.payload)
                } else {
                    logger.error(error, 'Unexpected error')
                    res.status(500).send()
                }
            }
        }
    }

    private getContentType(req: SlushyRequest, resourceResponse: { status: number; payload?: any }) {
        const operationObject = req[OperationObjectSymbol]
        // FIXME: Lookup range
        const responseObject = (operationObject.responses || {})[`${resourceResponse.status}`]

        if (!responseObject || isReferenceObject(responseObject)) {
            return
        }

        const responseTypes = Object.keys(responseObject.content || {})
        return responseTypes[0]
    }
}
