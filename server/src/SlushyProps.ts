import { OpenAPIV3 } from "openapi-types";
import { SlushyConfig } from "./SlushyConfig";

export interface SlushyProps extends SlushyConfig {
    openApi: OpenAPIV3.Document;
}
