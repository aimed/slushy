import bodyParser from 'body-parser'
import { SlushyProps } from '../SlushyProps'
import { MiddlewareFactory } from './MiddlewareFactory'

export class BodyParserMiddlewareFactory implements MiddlewareFactory {
    public create(_props: SlushyProps<any>) {
        return [bodyParser.json()]
    }
}
