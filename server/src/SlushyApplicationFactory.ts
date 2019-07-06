import express from 'express'
import helmet from 'helmet'
import { SlushyApplication } from './ServerImpl'
import { SlushyProps } from './SlushyProps'

export class SlushyApplicationFactory {
    public create(_props: SlushyProps<any>): SlushyApplication {
        const app = express()
        app.use(helmet())
        return app
    }
}
