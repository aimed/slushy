import { MiddlewareFactory } from './MiddlewareFactory'
import { SlushyProps } from '../SlushyProps'
import { SlushyRequestHandler } from '../ServerImpl'

export class RequestValidatorMiddlewareFactory implements MiddlewareFactory {
    create(_props: SlushyProps<any>): SlushyRequestHandler[] {
        return []
    }
}
