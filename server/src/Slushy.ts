// import { fs } from 'mz'
import { SlushyRouter } from './SlushyRouter'
import { SlushyApplication, SlushyApplicationFactory } from './ServerImpl'
import { SlushyProps } from './SlushyProps'
import { SlushyConfig } from './SlushyConfig'
import { SlushyPlugins } from './SlushyPlugins'
import { DefaultLoggerFactory } from './LoggerFactory'
import { OpenAPIV3 } from 'openapi-types'

export class Slushy<TContext> {
    public constructor(
        public readonly props: Readonly<SlushyProps<TContext>>,
        public readonly app: SlushyApplication = SlushyApplicationFactory.create(),
        public readonly router: SlushyRouter<TContext> = new SlushyRouter(props, app)
    ) {}

    public async start(port: number) {
        return new Promise((resolve, reject) =>
            this.app.listen(port, (error: Error) => (error ? resolve() : reject(error)))
        )
    }

    public async initialise() {
        await this.props.resourceConfiguration.configure(this.router)
    }

    public static async create<TContext>(config: SlushyConfig<TContext> & Partial<SlushyPlugins>) {
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
