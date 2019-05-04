import { MiddlewareFactory } from './MiddlewareFactory'
import bodyParser from 'body-parser'
import { SlushyProps } from '../SlushyProps'

export class BodyParser implements MiddlewareFactory {
    create(_props: SlushyProps) {
        return [bodyParser.json()]
    }
}
