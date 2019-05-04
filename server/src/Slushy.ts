import { fs } from 'mz'
import { SlushyRouter } from './SlushyRouter'
import { SlushyApplication, SlushyApplicationFactory } from './ServerImpl'
import { SlushyProps } from './SlushyProps'
import { SlushyConfig } from './SlushyConfig'

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

    public static async create(config: SlushyConfig) {
        const openApi = JSON.parse((await fs.readFile(config.resourceConfiguration.getOpenApiPath())).toString())
        const slushy = new Slushy({
            ...config,
            openApi,
        })
        await slushy.initialise()
        return slushy
    }
}
