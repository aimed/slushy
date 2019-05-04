import { MiddlewareFactory } from './MiddlewareFactory'
import { SlushyProps } from '../SlushyProps'
import openApiUi from 'swagger-ui-express'

export class ApiDoc implements MiddlewareFactory {
    create(props: SlushyProps) {
        return [openApiUi.serve, openApiUi.setup(props.openApi)]
    }
}
