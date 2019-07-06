import express from 'express'
import { SlushyProps } from './SlushyProps'
import { SlushyRouter } from './SlushyRouter'
import { SlushyApplication } from './ServerImpl'

export class SlushyRouterFactory {
    public create(props: SlushyProps<any>, app: SlushyApplication): SlushyRouter<any> {
        const routerImplementation = express.Router()
        app.use(routerImplementation)
        const router = new SlushyRouter(props, routerImplementation)
        return router
    }
}
