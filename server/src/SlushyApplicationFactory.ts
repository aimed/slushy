import express from 'express'
import { SlushyApplication } from './ServerImpl'
import helmet from 'helmet'
import { SlushyProps } from './SlushyProps'

export class SlushyApplicationFactory {
    public create(_props: SlushyProps<any>): SlushyApplication {
        const app = express()
        app.use(helmet())
        return app
    }
}
