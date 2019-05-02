import { Middleware } from "./Middleware";
import bodyParser from 'body-parser'

export class BodyParser implements Middleware {
    create() {
        return bodyParser.json()
    }
}