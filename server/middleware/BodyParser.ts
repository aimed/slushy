import { Middleware } from "./Middleware";
import bodyParser from 'body-parser'
import { SlushyProps } from "../SlushyProps";

export class BodyParser implements Middleware {
    create(_props: SlushyProps) {
        return [bodyParser.json()]
    }
}