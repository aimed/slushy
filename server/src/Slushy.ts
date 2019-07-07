import { Server } from 'http'
import { OpenAPIV3 } from 'openapi-types'
import { DefaultLoggerFactory } from './LoggerFactory'
import { SlushyApplication } from './ServerImpl'
import { SlushyApplicationFactory } from './SlushyApplicationFactory'
import { SlushyConfig } from './SlushyConfig'
import { SlushyProps } from './SlushyProps'
import { SlushyRouter } from './SlushyRouter'
import { SlushyRouterFactory } from './SlushyRouterFactory'

export class Slushy<TContext> {
    public readonly app: SlushyApplication
    public readonly router: SlushyRouter<TContext>
    public server?: Server

    public constructor(
        public readonly props: Readonly<SlushyProps<TContext>>,
        appFactory = new SlushyApplicationFactory(),
        routerFactory = new SlushyRouterFactory(),
    ) {
        this.app = appFactory.create(props)
        this.router = routerFactory.create(props, this.app)
    }

    public async start(port: number) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, (error: Error) => (error ? reject(error) : resolve()))
        })
    }

    public async initialise() {
        await this.props.resourceConfiguration.configure(this.router)
    }

    public static async create<TContext>(config: SlushyConfig<TContext>) {
        const openApi = JSON.parse(config.resourceConfiguration.getOpenApiSchema()) as OpenAPIV3.Document
        const slushy = new Slushy({
            openApi,
            loggerFactory: new DefaultLoggerFactory(),
            ...config,
        })
        await slushy.initialise()
        return slushy
    }
}
