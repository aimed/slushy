import { Middleware } from "./Middleware";
import bodyParser from 'body-parser'
import { AtlantisProps } from "../AtlantisProps";

export class BodyParser implements Middleware {
    create(_props: AtlantisProps) {
        return [bodyParser.json()]
    }
}