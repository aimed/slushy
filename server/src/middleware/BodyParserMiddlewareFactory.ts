import { MiddlewareFactory } from './MiddlewareFactory'
import bodyParser from 'body-parser'
import { SlushyProps } from '../SlushyProps'

export class BodyParserMiddlewareFactory implements MiddlewareFactory {
    create(_props: SlushyProps<any>) {
        return [bodyParser.json()]
    }
}
