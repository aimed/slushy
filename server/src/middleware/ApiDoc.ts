import { MiddlewareFactory } from './MiddlewareFactory'
import { SlushyProps } from '../SlushyProps'
import openApiUi from 'swagger-ui-express'

export class ApiDoc implements MiddlewareFactory {
    create(props: SlushyProps<any>) {
        return [openApiUi.serve, openApiUi.setup(props.openApi)]
    }
}
