// import { fs } from 'mz'
import { SlushyRouter } from './SlushyRouter'
import { SlushyApplication, SlushyApplicationFactory } from './ServerImpl'
import { SlushyProps } from './SlushyProps'
import { SlushyConfig } from './SlushyConfig'
import { SlushyPlugins } from './SlushyPlugins'
import { DefaultLoggerFactory } from './LoggerFactory'
import { OpenAPIV3 } from 'openapi-types'

export class Slushy {
    public constructor(
        public readonly props: Readonly<SlushyProps>,
        public readonly app: SlushyApplication = SlushyApplicationFactory.create(),
        public readonly router: SlushyRouter = new SlushyRouter(props, app)
    ) {}

    public async start(port: number) {
        return new Promise(resolve => this.app.listen(port, resolve))
    }

    public async initialise() {
        await this.props.resourceConfiguration.configure(this.router)
    }

    public static async create(config: SlushyConfig & Partial<SlushyPlugins>) {
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
