import { fs } from 'mz'
import { SlushyRouter } from './SlushyRouter'
import { SlushyApplication, SlushyApplicationFactory } from './ServerImpl'
import { SlushyProps } from './SlushyProps'
import { SlushyConfig } from './SlushyConfig'
import { SlushyPlugins } from './SlushyPlugins'
import { DefaultLoggerFactory } from './LoggerFactory'
import express = require('express');

export class Slushy {
    public constructor(
        public readonly props: Readonly<SlushyProps>,
        public readonly app: SlushyApplication = SlushyApplicationFactory.create(),
        public router: SlushyRouter = new SlushyRouter(props, express.Router())
    ) {
        app.use(router.router)
    }

    public async start(port: number) {
        return new Promise(resolve => this.app.listen(port, resolve))
    }

    public async initialise() {
        await this.props.resourceConfiguration.configure(this.router)
    }

    public static async create(config: SlushyConfig & Partial<SlushyPlugins>) {
        const openApi = JSON.parse((await fs.readFile(config.resourceConfiguration.getOpenApiPath())).toString())
        const slushy = new Slushy({
            openApi,
            authenticationMiddleware: config.authenticationMiddleware,
            loggerFactory: new DefaultLoggerFactory(),
            ...config,
        })
        await slushy.initialise()
        return slushy
    }
}
