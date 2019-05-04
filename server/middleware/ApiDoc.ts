import { Middleware } from "./Middleware";
import { SlushyProps } from "../SlushyProps";
import openApiUi from 'swagger-ui-express'

export class ApiDoc implements Middleware {
    create(props: SlushyProps) {
        return [openApiUi.serve, openApiUi.setup(props.openApi)]
    }
}