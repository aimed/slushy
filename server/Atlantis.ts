import { fs } from "mz";
import { AtlantisRouter } from "./AtlantisRouter";
import { AtlantisApplication, AtlantisApplicationFactory } from "./ServerImpl";
import { AtlantisProps } from "./AtlantisProps";
import { AtlantisConfig } from "./AtlantisConfig";

export class Atlantis {

    public constructor(
        public readonly props: Readonly<AtlantisProps>,
        public readonly app: AtlantisApplication = AtlantisApplicationFactory.create(),
        public readonly router: AtlantisRouter = new AtlantisRouter(props, app),
    ) {
    }

    public async start(port: number) {
        return new Promise(resolve => this.app.listen(port, resolve))
    }

    public async initialise() {
        await this.props.resourceConfiguration.configure(this.router)
    }

    public static async create(config: AtlantisConfig) {
        const openApi = JSON.parse((await fs.readFile(config.resourceConfiguration.getOpenApiPath())).toString())
        const atlantis = new Atlantis({
            ...config,
            openApi,
        })
        await atlantis.initialise()
        return atlantis
    }
}