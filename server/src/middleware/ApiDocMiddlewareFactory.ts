import openApiUi from 'swagger-ui-express'
import { SlushyProps } from '../SlushyProps'
import { MiddlewareFactory } from './MiddlewareFactory'

export class ApiDocMiddlewareFactory implements MiddlewareFactory {
    public create(props: SlushyProps<any>) {
        return [openApiUi.serve, openApiUi.setup(props.openApi)]
    }
}
