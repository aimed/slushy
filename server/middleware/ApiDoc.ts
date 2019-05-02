import { Middleware } from "./Middleware";
import { AtlantisProps } from "../Atlantis";
import openApiUi from 'swagger-ui-express'

export class ApiDoc implements Middleware {
    create(props: AtlantisProps) {
        return [openApiUi.serve, openApiUi.setup(props.openApi)]
    }
}